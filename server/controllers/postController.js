const fs = require("fs");
const imagekit = require("../configs/imagekit");
const { IMAGEKIT_URL_ENDPOINT } = require("../utils/constants");
const Post = require("../models/Post");
const User = require("../models/User");

const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;
    let image_urls = [];

    if (images && images.length > 0) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          //const fileBuffer = fs.readFileSync(image.path);
          const base64file = image.buffer.toString("base64");

          const response = await imagekit.files.upload({
            //file: fileBuffer,
            file: base64file,
            fileName: image.originalname,
            folder: "posts",
          });

          const url = imagekit.helper.buildSrc({
            src: response.filePath,
            urlEndpoint: IMAGEKIT_URL_ENDPOINT,
            transformation: [
              { quality: "auto", format: "webp", width: "1280" },
            ],
          });

          return url;
        }),
      );
    }

    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    res.json({ success: true, message: "Post created!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await Post.findById(postId);

    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter((user) => user !== userId);
      await post.save();
      res.json({ success: true, message: "Post Unliked!" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      res.json({ success: true, message: "Post Liked!" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = { addPost, getFeedPosts, likePost };
