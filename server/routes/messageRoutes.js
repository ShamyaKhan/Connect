const express = require("express");
const { upload } = require("../configs/multer");
const { protect } = require("../middlewares/auth");
const {
  sseController,
  sendMessage,
  getChatMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.get("/:userId", sseController);

router.post("/send", upload.single("image"), protect, sendMessage);

router.post("/get", protect, getChatMessages);

module.exports = router;
