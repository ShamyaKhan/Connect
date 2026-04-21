const imagekit = require("../configs/imagekit");
const User = require("../models/User");
const fs = require("fs");
const { IMAGEKIT_URL_ENDPOINT } = require("../utils/constants");
const Connection = require("../models/Connection");
const Post = require("../models/Post");
const { inngest } = require("../inngest");

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
    let { username, bio, full_name, location } = req.body;

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

const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const connectionRequest = await Connection.find({
      from_user_id: userId,
      createdAt: { $gt: last24Hours },
    });

    // cannot send more than 20 requests in 24 hours
    if (connectionRequest.length >= 20) {
      return res.json({
        success: false,
        message: "You already sent maximum number of requests",
      });
    }

    //if users are already connected
    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!connection) {
      const newConnection = await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });
      await inngest.send({
        name: "app/connection-request",
        data: { connectionId: newConnection._id },
      });
      return res.json({
        success: true,
        message: "Request sent successfully",
      });
    } else if (connection && connection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user",
      });
    }

    res.json({ success: false, message: "Request Pending" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId).populate(
      "connections followers following",
    );

    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnections = await Connection.find({
      to_user_id: userId,
      status: "pending",
    })
      .populate("from_user_id")
      .map((connection) => connection.from_user_id);

    res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      return res.json({
        success: false,
        message: "Connection not found",
      });
    }

    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = "accepted";
    connection.save();

    res.json({ success: true, message: "Connection Accepted" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getUserProfiles = async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await User.findById(profileId);

    if (!profile) {
      return res.json({ success: false, message: "Profile not found!" });
    }

    const posts = await Post.find({ user: profileId }).populate("user");

    res.json({ success: true, profile, posts });
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
  sendConnectionRequest,
  getUserConnections,
  acceptConnectionRequest,
  getUserProfiles,
};
