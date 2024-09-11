const model = require('../model/userModel');
const users = model.users;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local');
require('dotenv').config();

var salt = bcrypt.genSaltSync(parseInt(process.env.SALT));

// user signUp function
exports.signUp = async (req, res) => {
  try {
    const user = await users.find({ username: req.body.username });

    if (user.length > 0) { return res.status(400).json({ message: "Email already in use" }); }
    const newUser = new users();
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);


    newUser.name = req.body.name;
    newUser.profile = "/public/images/blank profile.jpg" ;
    newUser.username = req.body.username;
    newUser.password = hashedPassword.toString('hex');
    newUser.save()
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
};

// user login function
exports.login = (req, res, next) => {
    try {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ success: false });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({ redirectUrl: '/dashbord' });
        });
      })(req, res, next);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
  }
  // middleware between login to profile
  exports.isAuth = (req, res, next) => {
    try {
      if (!req.user) {
        return res.redirect('/');
      }
      return next();
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
  
  }

// logout function
exports.logOut = (req, res, next) => {
    try {
      req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: 'internal server error.pls try again later.' })
    }
  
  };

// passport initialization
exports.initializePass = (passport) => {
    passport.use(new localStrategy(async function verify(username, password, done) {
      const user = await users.findOne({ username });
  
      console.log("here");
      if (!user) { return done(null, false); }
  
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          return done(err);
        }
        if (!result) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      });
  
    }));
  
    passport.serializeUser((user, done) => {
      console.log("on");
      done(null, user._id)
    });
  
    passport.deserializeUser(async function (user, done) {
      console.log("off");
      done(null, user);
    });
  };