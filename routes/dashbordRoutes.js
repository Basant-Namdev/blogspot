const express = require('express')
const router = express.Router()
const dashbordController = require('../controller/dashbordController')
const homeController = require('../controller/homeController')
const multer = require('multer');
const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 },dest: './uploads/' });



router
    .get('/',homeController.isAuth,dashbordController.dashbordRender)
    .get('/myBlogs',dashbordController.myBlogsRender)
    .get('/postBlog',dashbordController.postBlog)
    .get('/editBlog/:id',dashbordController.postBlog)
    .get('/userDetails',dashbordController.userDetails)
    .get('/editDetails',dashbordController.editDetails)
    .post('/editDetails/save', upload.single('image') ,dashbordController.saveDetails)
    .get('/resetPassword',dashbordController.resetPassword)
    .patch('/passwordReset', dashbordController.passwordReset)
    .get('/:id',dashbordController.openBlog)
    .post('/postBlog/saveBlog', upload.single('coverImage'), dashbordController.saveBlog)
    .delete('/myBlogs/deleteBlog/:id',dashbordController.deleteBlog)

exports.router = router