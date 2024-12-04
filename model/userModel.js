const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true ,unique : true},
    password: { type: String, required: true },
    gender: {type:String},
    dob:{type:String},
    profile:{type:String},
    resetToken: {type:String},
    resetTokenExpiration: Date
});

const blogSchema = new Schema({
    postBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    category: { type: String, required: true },
    blogContent: { type: String, required: true },
}, {
    timestamps: true
  }
);

exports.users = mongoose.model('users', userSchema);
exports.blogs = mongoose.model('blogs', blogSchema);