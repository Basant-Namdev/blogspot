const express = require('express')
const mongoose = require('mongoose');
const myFunctions = require('../myFunctions');
const model = require('../model/userModel')
const blogModel = model.blogs;
const users = model.users;
const cloudinary = require('cloudinary').v2;
const cheerio = require('cheerio');
const bcrypt = require('bcrypt');

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
    const blogDetails = await blogModel.find().populate('postBy', 'name profile').select('-blogContent');
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

    const blogDetails = await blogModel.find({ postBy: userId }).populate('postBy', 'name profile');

    myFunctions.renderView(req,res, 'myBlogs', {blogs : blogDetails})

  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}

// render post blog page
exports.postBlog = (req, res) => {
  try {
    myFunctions.renderView(req,res, 'postBlog', { tinymce: process.env.TINYMCE })

  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// this is to post the blog
exports.saveBlog = async (req, res) => {
  try {
    const blog = new blogModel();
    const content = req.body.blogContent;
    let file,filepath;
    if (req.file) {
      file = req.file;
    }
    if (file) {
        // Upload to cloudinary
        await cloudinary.uploader.upload(req.file.path,{
          folder: 'blogspot/blogs',
        }, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: 'internal server error.pls try again later.'
                })
            } else {
                filepath = result.url;
                blog.coverImage = filepath;
            }
        })
    }
    // Load the content into Cheerio
    const $ = cheerio.load(content);

    // Extract images from the editor content
    const images = $('img').map((index, img) => $(img).attr('src')).get();

    // Upload images to cloudinary
    if (images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map((image) => {
          return cloudinary.uploader.upload(image, {
            folder: 'blogspot/blogs',
          }, async (err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({
                success: false
              })
            }
          });
        })
      );

      // Replace image URLs with Cloudinary URLs
      $('img').each((index, img) => {
        const uploadedImage = uploadedImages.find((image) => image.url === $(img).attr('src'));
        if (uploadedImage) {
          $(img).attr('src', uploadedImage.secure_url);
        } else {
          console.log(`Error: Could not find uploaded image for ${$(img).attr('src')}`);
        }
      });
    }

    // Get the updated content
    const editorContent = $.html();
    blog.postBy = new mongoose.Types.ObjectId(req.user);
    blog.title = req.body.title;
    blog.description = req.body.description;
    blog.category = req.body.category;
    blog.blogContent = editorContent;
    blog.save()
      .then((data) => {
        res.status(200).json({ message: 'blog saved successfully', data: data, success: true })
      })
      .catch((err) => {
        res.status(500).json({ message: 'Error saving blog', error: err, success: false })
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false })
  }

}
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
