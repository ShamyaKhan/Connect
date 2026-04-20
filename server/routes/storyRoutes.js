const express = require("express");
const { protect } = require("../middlewares/auth");
const { addUserStory, getStories } = require("../controllers/storyController");
const { upload } = require("../configs/multer");

const router = express.Router();

router.post("/create", upload.single("media"), protect, addUserStory);

router.get("/get", protect, getStories);

module.exports = router;
