const express = require('express')
const mongoose = require('mongoose');
const myFunctions = require('../myFunctions');
const model = require('../model/userModel')
const blogModel = model.blogs;
const users = model.users;
const cloudinary = require('cloudinary').v2;
const cheerio = require('cheerio');
const bcrypt = require('bcrypt');
const mime = require('mime-types');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Setup DOMPurify with JSDOM
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

require('dotenv').config();
// cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
// renders dashbord page
exports.dashbordRender = async (req, res) => {
  try {
    const blogDetails = await blogModel.find().populate('postBy', 'name profile').sort({ createdAt: -1 }).select('-blogContent');
    myFunctions.renderView(req,res, 'dashbord', {blogs : blogDetails})

  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// renders myBlogs page
exports.myBlogsRender = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);

    const blogDetails = await blogModel.find({ postBy: userId }).populate('postBy', 'name profile').sort({ createdAt: -1 });

    myFunctions.renderView(req,res, 'myBlogs', {blogs : blogDetails})

  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}

// render post blog page
exports.postBlog = async (req, res) => {
  try {
    if (req.params.id) {
      const  blog = await blogModel.findById(req.params.id);
      myFunctions.renderView(req,res, 'postBlog', { tinymce: process.env.TINYMCE , blog : blog })
    } else {
      myFunctions.renderView(req,res, 'postBlog', { tinymce: process.env.TINYMCE })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// this is to post the blog
exports.saveBlog = async (req, res) => {
  try {
    let blog;
    if (req.body.blogId) {
      blog = await blogModel.findById(req.body.blogId);
    } else {
      blog = new blogModel();
    }

    let filepath;
    const file = req.file;

    // Check cover image MIME type
    if (file) {
      const mimeType = mime.lookup(file.originalname);
      if (!mimeType?.startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'Only image files are allowed.' });
      }

      // Upload cover image to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'blogspot/blogs',
      });

      filepath = result.secure_url;
      blog.coverImage = filepath;
    }

    // Sanitize blog content
    const rawContent = req.body.blogContent || '';
    const cleanContent = DOMPurify.sanitize(rawContent, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['style', 'class'],
    });

    // Load sanitized HTML into Cheerio
    const $ = cheerio.load(cleanContent);

    // Extract <img> sources
    const images = $('img').map((i, el) => $(el).attr('src')).get();

    // Upload embedded images to Cloudinary and update URLs
    if (images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map(async (imgSrc) => {
          try {
            const uploaded = await cloudinary.uploader.upload(imgSrc, {
              folder: 'blogspot/blogs',
            });
            return { original: imgSrc, url: uploaded.secure_url };
          } catch (err) {
            console.error('Image upload error:', err);
            return null;
          }
        })
      );

      $('img').each((i, el) => {
        const currentSrc = $(el).attr('src');
        const found = uploadedImages.find(img => img?.original === currentSrc);
        if (found) {
          $(el).attr('src', found.url);
        }
      });
    }

    const finalContent = $.html();

    // Set blog fields
    blog.postBy = req.user; // Assuming user is already an ObjectId
    blog.title = req.body.title;
    blog.description = req.body.description;
    blog.blogContent = finalContent;

    await blog.save();
    return res.status(200).json({ success: true, message: 'Blog saved successfully.', data: blog });

  } catch (error) {
    console.error('Error in saveBlog:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
// show individual blog
exports.openBlog = async(req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await blogModel.findById(blogId).select('blogContent')    
    myFunctions.renderView(req,res, 'openBlog', {blog : blog})
    
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// DELETE API to delete a blog post by ID
exports.deleteBlog =  async (req, res) => {
  const { id } = req.params;

  try {
      const deletedBlog = await blogModel.findByIdAndDelete(id);
      if (!deletedBlog) {
          return res.status(404).send({ message: 'Blog not found' });
      }
      res.status(200).send({ message: 'Blog deleted successfully'});
  } catch (error) {
      res.status(500).send({ message: 'Error deleting blog', error });
  }
}
// render reset password page
exports.resetPassword = async (req, res) => {
  try {
    myFunctions.renderView(req,res, 'resetPassword', {});

  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'internal server error. unable to take this request. pls try again later.' })
  }
}
// it resets the password
var salt = bcrypt.genSaltSync(parseInt(process.env.SALT));
exports.passwordReset = async (req, res) => {
  try {
    const user = await users.findById(req.user);
    const isValid = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid old password' });
    }
    const hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);
    user.password = hashedPassword.toString('hex');
    user.save()
      .then(() => {
        res.status(201).json({ success: true })
      })
      .catch(error => {
        console.log("Error Creating User", error);
        res.status(500).json({ success: false })
      })
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// to view the detail of the user when user is logged in
exports.userDetails = async (req, res) => {
  try {
      const user = await users.findById(req.user);
      myFunctions.renderView(req,res, 'userDetails', { user: user });
  } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// it is to send the edit detail from 
exports.editDetails = async (req, res) => {
  try {
      const user = await users.findById(req.user);
      myFunctions.renderView(req,res, 'editDetails', { user: user });

  } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// it stores the details got from editform 
exports.saveDetails = async (req, res) => {
  // Upload an image
  const user = await users.findById(req.user);
  let profileImg,profileId;
  if (user.profile.startsWith('http')) {
       profileImg = user.profile.split('/')[7];
       profileId = profileImg.slice(0, profileImg.lastIndexOf('.'));
  }
  
  let filepath, file;
  if (req.file) {
    file = req.file;
  }
  if (file) {
      // Upload to cloudinary
      await cloudinary.uploader.upload(req.file.path,{
        folder: 'blogspot/userProfiles',
      }, (err, result) => {
          if (err) {
              console.log(err);
              return res.status(500).json({
                  message: 'internal server error.pls try again later.'
              })
          } else {
              filepath = result.url;
              user.profile = filepath;
          }
      })
  }
  try {  
      user.name = req.body.name;
      user.dob = (req.body.dob).split("T")[0];
      user.gender = req.body.gender;
      await user.save().then(() => { res.redirect("/dashbord/userDetails"); }).catch(err => {
          console.log(err);
          return res.sendStatus(500);
      })
      if (profileId && file) {
          // delete image from cloudinary
          cloudinary.uploader
              .destroy(profileId)
              .then(() => {
                  console.log("image replaced");
              })
              .catch((error) => {
                  console.log(error);
              });
      }

  } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'internal server error.pls try again later.' })
  }
}
