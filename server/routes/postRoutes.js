const express = require("express");
const { upload } = require("../configs/multer");
const { protect } = require("../middlewares/auth");
const {
  addPost,
  getFeedPosts,
  likePost,
} = require("../controllers/postController");

const router = express.Router();

router.post("/add", upload.array("images", 4), protect, addPost);

router.get("/feed", protect, getFeedPosts);

router.post("/like", protect, likePost);

module.exports = router;
