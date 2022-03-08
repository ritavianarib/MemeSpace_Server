const mongoose = require('mongoose');
const {Schema, model} = require ('mongoose')

const bookingSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "UserModel",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserModel" }],
    comments: [
      {
        text: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" },
      },
    ],
  },
  { timestamps: true }
);

const Post = model('Post', PostSchema);

module.exports = Post;