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
const isProd = process.env.NODE_ENV === "production";


main().catch(err => console.log(err));

async function main() {
  try {
    dbConnection = await mongoose.connect(process.env.MONGODB_URL);
    console.log("database connected");
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
}
server.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],

      /* TinyMCE & cdn.jsdelivr scripts */
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",                         // TinyMCE still needs inline for now
        "https://cdn.tiny.cloud",
        "https://cdn.jsdelivr.net",
        "https://kit.fontawesome.com",
      ],

      /* Remote stylesheets + inline styles TinyMCE injects */
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.tiny.cloud",
        "https://cdn.jsdelivr.net",
        "https://kit.fontawesome.com",
      ],

      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net",
        "https://kit.fontawesome.com",
        "https://ka-f.fontawesome.com",
      ],

      connectSrc: [
        "'self'",
        "https://cdn.tiny.cloud",
        "https://ka-f.fontawesome.com",
      ],

      /* Images you actually serve */
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://res.cloudinary.com",
        "https://sp.tinymce.com",
      ],

      objectSrc: ["'none'"],                      // safer Flash/Object ban
      upgradeInsecureRequests: [],               // auto‑upgrade HTTP → HTTPS
    },
  })
);
server.use(helmet.frameguard({ action: "sameorigin" }));      // X‑Frame‑Options
server.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
server.use(
  helmet.hsts({
    maxAge: 31536000,                                          // 1 year
    includeSubDomains: true,
    preload: true,
  })
);
server.disable('x-powered-by');
server.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  next();
});
server.use(helmet.noSniff());


server.use(
  cors(
    isProd
      ? { origin: ["https://blogspot-r6oo.onrender.com/"], credentials: true }
      : {} // allow all in dev
  )
);server.use(express.json());
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