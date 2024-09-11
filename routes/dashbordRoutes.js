const express = require('express')
const router = express.Router()
const dashbordController = require('../controller/dashbordController')
const homeController = require('../controller/homeController')
const multer = require('multer');
const upload = multer({ dest: './uploads/' });



router
    .get('/',homeController.isAuth,dashbordController.dashbordRender)
    .get('/myBlogs',dashbordController.myBlogs)
    .get('/postBlog',dashbordController.postBlog)
    .post('/postBlog/saveBlog', upload.single('content'), dashbordController.saveBlog)

exports.router = router