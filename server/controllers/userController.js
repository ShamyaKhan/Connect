const imagekit = require("../configs/imagekit");
const User = require("../models/User");
const fs = require("fs");
const { IMAGEKIT_URL_ENDPOINT } = require("../utils/constants");

const getUserData = async () => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User Not Found!" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const updateUserData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { username, bio, full_name, location } = req.body;

    const tempUser = await User.findById(userId);

    !username && (username = tempUser.username);

    if (tempUser.username !== username) {
      const user = await User.findOne({ username });
      if (user) {
        // username already taken
        username = tempUser.username;
      }
    }

    const updatedUser = { username, bio, location, full_name };
    const profile = req.files.profile && req.files.profile[0];
    const cover = req.files.cover && req.files.cover[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);

      const response = await imagekit.files.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      const url = imagekit.helper.buildSrc({
        urlEndPoint: IMAGEKIT_URL_ENDPOINT,
        src: response.filepath,
        transformation: [{ quality: "auto", format: "webp", width: "512" }],
      });

      updatedUser.profile_picture = url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);

      const response = await imagekit.files.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      const url = imagekit.helper.buildSrc({
        urlEndPoint: IMAGEKIT_URL_ENDPOINT,
        src: response.filepath,
        transformation: [{ quality: "auto", format: "webp", width: "1280" }],
      });

      updatedUser.cover_photo = url;
    }

    const user = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });

    res.json({ success: true, user, message: "Profile Updated!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter((user) => user._id !== userId);

    res.json({ success: true, users: filteredUsers });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user!",
      });
    }

    user.following.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();

    res.json({ success: true, message: "Now you're following this user!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);

    user.following = user.following.filter((user) => user !== id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers = toUser.followers.filter((user) => user !== userId);
    await toUser.save();

    res.json({ success: true, message: "Now you no longer follow this user!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = {
  getUserData,
  updateUserData,
  discoverUsers,
  followUser,
  unfollowUser,
};
