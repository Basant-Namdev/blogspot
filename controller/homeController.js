const model = require('../model/userModel');
const users = model.users;
const blogs = model.blogs;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const localStrategy = require('passport-local');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const ejs = require('ejs');
const path = require('path');
const myFunctions = require('../myFunctions');

require('dotenv').config();

var salt = bcrypt.genSaltSync(parseInt(process.env.SALT));

// render home page
exports.renderHome = async (req, res) => {
  try {
    const homeBlogs = await blogs.find() .sort({ createdAt: -1 }).limit(3).select('-blogContent');
    ejs.renderFile(path.resolve(__dirname, `../public/index.ejs`), {blogs : homeBlogs}, function (err, str) {
      if (!err) {
        res.send(str);
      } else {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// user signUp function
exports.signUp = async (req, res) => {
  try {
    const user = await users.find({ username: req.body.username });

    if (user.length > 0) { return res.status(400).json({ message: "Email already in use" }); }
    const newUser = new users();
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);


    newUser.name = req.body.name;
    newUser.profile = "/public/images/blank profile.jpg";
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
        return res.json({ redirectUrl: '/dashbord', success: true });
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

// forget - reset password
// render forget-password page
exports.renderforgetPassword = async (req, res) => {
  try {
    myFunctions.renderView(req,res, 'forgetPassword', {});
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// send reset password link
exports.forgetPassword = async (req, res) => {
  const username = req.body.email;
  const user = await users.findOne({ username });

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL,
        pass: process.env.PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.GMAIL,
      to: username,
      subject: 'Reset Password',
      text: `Click the following link to reset your password: http://localhost:3000/reset-password/${token} . This link is valid only for 15 min.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send({ message: 'Error sending email. Try again later.' });
      }
      res.status(200).send({ message: 'Check your email for link to reset your password' });
    });
  } else {
    res.status(404).send({ message: 'Email not found. User does not exist' });
  }
}
// render forget-reset-password page
exports.renderForgetResetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await users.findOne({ resetToken: token }).select('-password -dob -gender -resetToken -resetTokenExpiration -_id');
    console.log(user);

    myFunctions.renderView(req,res, 'ForgetResetPassword', { user: user });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'internal server error.pls try again later.' })
  }
}
// reset the password
exports.forgetResetPassword = async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  const user = await users.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  });

  if (user) {
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.status(200).send('Password has been reset successfully');
  } else {
    res.status(400).send('Invalid or expired token');
  }
}