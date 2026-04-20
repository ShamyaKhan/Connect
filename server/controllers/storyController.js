const fs = require("fs");
const imagekit = require("../configs/imagekit");
const Story = require("../models/Story");
const User = require("../models/User");

const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;
    let media_url = "";

    // upload media to imagekit
    if (media_type === "image" || media_type === "video") {
      const fileBuffer = fs.readFileSync(media.path);
      const response = await imagekit.files.upload({
        file: fileBuffer,
        fileName: media.originalname,
      });
      media_url = response.url;
    }

    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    res.json({ success: true, message: "Story Created!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    const userIds = [userId, ...user.connections, ...user.following];

    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = { addUserStory, getStories };
