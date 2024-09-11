const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors');
var passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dashbordRoutes = require('./routes/dashbordRoutes')
const homeRoutes = require('./routes/homeRoutes')

require('dotenv').config();


main().catch(err => console.log(err));

async function main() {
  try {
    dbConnection = await mongoose.connect(process.env.MONGODB_URL);
    console.log("database connected");
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
}

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static("public"));
server.use('/public',express.static("public"));

server.use(passport.initialize());
server.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongoUrl: process.env.MONGODB_URL })
}));
server.use(passport.authenticate('session'));

server.use('/', homeRoutes.router);
server.use('/dashbord',dashbordRoutes.router)

server.listen(process.env.PORT, () => { console.log("Server is running ") });