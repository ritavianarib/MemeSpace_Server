const express = require('express');
const router = require('express').Router;


const isAuth = require("../middlewares/isAuth");
const PostModel = require("../models/Post.model")

const { check } = require("express-validator"); 
const isAuthenticated = require('../middlewares/isAuthenticated');

router.post(
  "/createpost",
  isAuthenticated,
  [
    check("title", "Title of the post is required").not().isEmpty(),
    check("body", "Body souldnot be empty").not().isEmpty(),
    check("url", "Photo souldnot be empty").not().isEmpty(),
  ],
  (req, res) => {
    req.user.password = undefined;
    const { title, body, photo } = req.body;
    const post = new PostModel({
      title,
      body,
      photo,
      postedBy: req.user,
    });
    post
      .save()
      .then((result) => {
        res.json({ post: result });
      })
      .catch((err) => console.log(err));
  }
);

// all post of non following user
router.get("/allposts", isAuthenticated, (req, res) => {
  PostModel.find({
    postedBy: {
       
        $nin:req.user.following
      
    },
  })
    .populate("postedBy", "_id name email pic")
    .populate("comments.postedBy", "_id name ")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => console.log(err));
});

router.get("/myposts", isAuthenticated, (req, res) => {
  PostModel.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name email pic")
    .sort("-createdAt")
    .then((myposts) => {
      res.json({ myposts });
    })
    .catch((err) => console.log(err));
});

router.put("/likepost", isAuthenticated, (req, res) => {
  PostModel.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.user._id } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name email pic")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.put("/unlikepost", isAuthenticated, (req, res) => {
  PostModel.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name email pic")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.put("/comment", isAuthenticated, (req, res) => {
  console.log(req.body)
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  PostModel.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: comment } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name pic")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.put("/uncomment", isAuthenticated, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  PostModel.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: comment } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name pic")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

// single post 

router.get("/singlepost/:postId", isAuthenticated, (req, res) => {
  PostModel.findById(req.params.postId)
    .populate("postedBy", "_id name email pic")
    .populate("comments.postedBy", "_id name ")
    
    .then(onepost => {
      res.json( onepost );
    })
    .catch((err) => console.log(err));
});



router.delete("/delete/:postId", isAuthenticated, (req, res) => {
  PostModel.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            res.json(result);
          })
          .catch((err) => console.log(err));
      }
    });
});



// post of only those to whom im followed

router.get("/followedusersposts", isAuthenticated, (req, res) => {
  PostModel.find({postedBy:{$in:req.user.following}})
    .populate("postedBy", "_id name email pic")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => console.log(err));
});

// post of those whom im not following
router.get("/notfollowingusersposts", isAuthenticated, (req, res) => {
  PostModel.find({postedBy:{$nin:req.user.following}})
    .populate("postedBy", "_id name email pic")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => console.log(err));
});


module.exports = router;





