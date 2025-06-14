const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors');
var passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dashbordRoutes = require('./routes/dashbordRoutes')
const homeRoutes = require('./routes/homeRoutes')
const helmet = require('helmet');

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
server.use(helmet());
server.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tiny.cloud",
          "https://cdn.jsdelivr.net",
          "https://kit.fontawesome.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tiny.cloud",
          "https://cdn.jsdelivr.net",
          "https://kit.fontawesome.com",
          "https://fonts.googleapis.com"
        ],
        styleSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tiny.cloud",
          "https://cdn.jsdelivr.net",
          "https://kit.fontawesome.com",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net",
          "https://kit.fontawesome.com",
          "https://ka-f.fontawesome.com" // ✅ ADDED to fix font load error
        ],
        connectSrc: [
          "'self'",
          "https://cdn.tiny.cloud",
          "https://ka-f.fontawesome.com"
        ],
        imgSrc: ["'self'", "data:","blob:", "https://res.cloudinary.com","https://sp.tinymce.com"],
        objectSrc: ["'none'"]
      }
    }
  })
);



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