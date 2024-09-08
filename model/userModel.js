const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true ,unique : true},
    password: { type: String, required: true },
    profile:{type:String},
});

const blogSchema = new Schema({
    postBy: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    blogLink: { type: String, required: true },
    category: { type: String},
}, {
    timestamps: true
  }
);

exports.users = mongoose.model('users', userSchema);
exports.blogs = mongoose.model('blogs', blogSchema);