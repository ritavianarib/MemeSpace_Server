const express = require('express');
const router = express.Router();

const CommentModel = require("../models/Comment.model");
const PostModel = require("../models/Post.model")

const isAuthenticated = require('../middlewares/isAuthenticated');
const attachCurrentUser = require('../middlewares/attachCurrentUser');


// Crud (Create) => POST
router.post("/addComment", isAuthenticated, attachCurrentUser, async (req, res, next) => {
    try {
        const loggedInUser = req.currentUser;
        const result = await CommentModel.create({...req.body, postedBy: loggedInUser._id});
      // Adicionado a referência do comentário no post
      await PostModel.updateOne(
        { _id: req.body.postId},
        { $push: { comments: result._id } }
      ); // O operador $push serve para adicionar um novo elemento à uma array no documento
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  });


// crUd (Update) => PATCH
  router.patch("/editComment/:id", isAuthenticated, attachCurrentUser,(req, res, next) => {
    // Extraindo o parâmetro de rota
    const { id } = req.params;
  
    CommentModel.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body } },
      { new: true, runValidators: true }
    )
      .then((result) => {
        return res.status(200).json(result);
      })
      .catch((err) => {
        console.error(err);
        return next(err);
      });
  });


  // cruD (Delete) => DELETE
  router.delete("/deleteComment/:id", async (req, res, next) => {
    try {
      // Extraindo o parâmetro de rota
      const { id } = req.params;
  
      const result = await CommentModel.deleteOne({ _id: id });
  
      if (result.deletedCount < 1) {
        return res.status(404).json({ msg: "Comment not found" });
      }
  
      return res.status(200).json({});
    } catch (err) {
      console.error(err);
      return next(err);
    }
  });

  module.exports = router;