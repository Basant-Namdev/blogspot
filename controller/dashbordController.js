const express = require('express')
const myFunctions = require('../myFunctions')



exports.dashbordRender = (req,res) => {
    try {
        myFunctions.renderView(res,'dashbord',{})
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}
exports.allBlogs = (req,res) => {
    try {
        myFunctions.renderView(res,'blogs',{})
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}
exports.myBlogs = (req,res) => {
    try {
        myFunctions.renderView(res,'blogs',{})
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}
exports.postBlog = (req,res) => {
    try {
        myFunctions.renderView(res,'postBlog',{})
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
}

