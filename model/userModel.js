const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true ,unique : true},
    password: { type: String, required: true },
    profile:{type:String},
}, {
    timestamps: true
  }
);

const blogSchema = new Schema({
    postBy: { type: String, required: true },
    blogLink: { type: String, required: true ,unique : true},
    category: [ { type: String} ],
}, {
    timestamps: true
  }
);