const mongoose = require('mongoose');
const Schema = mongoose.Schema


const CommentSchema = new Schema({
 
  comments: { type: String },

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    publication: {type: mongoose.Schema.Types.ObjectId, ref: "Post"}
},

);

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;