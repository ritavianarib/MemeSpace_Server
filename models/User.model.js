const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true, match: /\s/gm },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    lowercase: true,
  },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "USER"],
    required: true,
    default: "USER",
  },
  pic: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png"
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bio: {
    type: String,
  }
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
