const mongoose = require('mongoose');
const Schema = mongoose.Schema


const PostSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  bg: {
    type: String,
  
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      text: String,
      postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
},
  { timestamps: true }
);

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;