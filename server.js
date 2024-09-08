const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dashbordRoutes = require('./routes/dashbordRoutes')

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

server.use('/dashbord',dashbordRoutes.router)

server.listen(process.env.PORT, () => { console.log("Server is running ") });