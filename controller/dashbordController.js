const express = require('express')
const mongoose = require('mongoose');
const myFunctions = require('../myFunctions');
const model = require('../model/userModel')
const blogModel = model.blogs;
const cloudinary = require('cloudinary').v2;
const cheerio = require('cheerio');



require('dotenv').config();
// cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

exports.dashbordRender = (req, res) => {
    try {
        myFunctions.renderView(res, 'dashbord', {})

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}
exports.myBlogs = (req, res) => {
    try {
        myFunctions.renderView(res, 'dashbord', {})

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}
exports.postBlog = (req, res) => {
    try {
        myFunctions.renderView(res, 'postBlog', { tinymce: process.env.TINYMCE })

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
      blog.postBy = req.user;
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