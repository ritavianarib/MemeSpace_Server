const express = require('express');
const router = express.Router();


const PostModel = require("../models/Post.model")
const UserModel = require("../models/User.model")

const { check } = require("express-validator");
const isAuthenticated = require('../middlewares/isAuthenticated');
const attachCurrentUser = require('../middlewares/attachCurrentUser');
const uploader = require("../config/cloudinary.config");

// Upload
router.post(
  "/upload",
  uploader.single("picture"),
  (req, res) => {
    console.log(req.file)
    if (!req.file) {
      return res.status(500).json({ msg: "O Upload de arquivo falhou." });
    }

    return res.status(201).json({ url: req.file.path });
  }
);



router.post(
  "/create-post",
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

router.post("/createpost", isAuthenticated, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;
    const createPost = await PostModel.create({
      ...req.body,
      postedBy: loggedInUser._id,
    },
    );

    return res.status(201).json(createGoal);
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(400).json(err.message ? err.message : err);
    }

    res.status(500).json(err);
  }
});

router.get("/mypost", isAuthenticated, attachCurrentUser, async (req, res) => {

  const loggedUser = req.currentUser;
  console.log(loggedUser)

  await PostModel.find({ postedBy: loggedUser._id })
    .populate("postedBy")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => console.log(err));
});

router.get("/allpost", isAuthenticated, (req, res) => {
  PostModel.find()
    .populate("postedBy")
    .populate("comments.postedBy")
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

router.put("/comment", isAuthenticated, attachCurrentUser, async (req, res) => {
  console.log(req.body)

  try {
    const loggedUser = req.currentUser;
    const postId = req.body.postId
    const comment = {
      text: req.body.text,
      postedBy: loggedUser._id,
    };
    const commentPosted = await PostModel.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true }
    )
    return res.status(200).json(commentPosted)
  } catch (e) {
    console.log(e)
    return res.status(500).json({ msg: e.message })
  }



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
      res.json(onepost);
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
  PostModel.find({ postedBy: { $in: req.user.following } })
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
  PostModel.find({ postedBy: { $nin: req.user.following } })
    .populate("postedBy", "_id name email pic")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => console.log(err));
});


module.exports = router;





