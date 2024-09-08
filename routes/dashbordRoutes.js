const express = require('express')
const router = express.Router()
const dashbordController = require('../controller/dashbordController')

router
    .get('/',dashbordController.dashbordRender)
    .get('/myBlogs',dashbordController.myBlogs)
    .get('/postBlog',dashbordController.postBlog)

exports.router = router