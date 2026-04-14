const express = require("express");
const { protect } = require("../middlewares/auth");
const {
  getUserData,
  updateUserData,
  discoverUsers,
  followUser,
  unfollowUser,
  sendConnectionRequest,
  acceptConnectionRequest,
  getUserConnections,
} = require("../controllers/userController");
const { upload } = require("../configs/multer");

const router = express.Router();

router.get("/data", protect, getUserData);

router.post(
  "/update",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  protect,
  updateUserData,
);

router.post("/discover", protect, discoverUsers);

router.post("/follow", protect, followUser);

router.post("/unfollow", protect, unfollowUser);

router.post("/connect", protect, sendConnectionRequest);

router.post("/accept", protect, acceptConnectionRequest);

router.get("/connections", protect, getUserConnections);

module.exports = router;
