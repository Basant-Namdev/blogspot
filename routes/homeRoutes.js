const express = require('express')
const router = express.Router()
const homeController = require('../controller/homeController')
const passport = require('passport');
const localStrategy = require('passport-local');
homeController.initializePass(passport);

router
    .post('/signUp',homeController.signUp)
    .post('/login',homeController.login)
    .get('/dashbord/logout', homeController.logOut)
    .get('/forget-password', homeController.renderforgetPassword)
    .post('/forget-password', homeController.forgetPassword)
    .get('/reset-password/:token', homeController.renderForgetResetPassword)
    .post('/reset-password/:token', homeController.forgetResetPassword)

exports.router = router