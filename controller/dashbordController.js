const express = require('express')
const myFunctions = require('../myFunctions');
const cloudinary = require('cloudinary').v2;

// cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});
require('dotenv').config();

exports.dashbordRender = (req,res) => {
    try {
        myFunctions.renderView(res,'dashbord',{})
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}
exports.myBlogs = (req,res) => {
    try {
        myFunctions.renderView(res,'dashbord',{})
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}
exports.postBlog = (req,res) => {
    try {
        myFunctions.renderView(res,'postBlog',{ tinymce : process.env.TINYMCE })
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}

