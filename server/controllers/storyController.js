const fs = require("fs");
const imagekit = require("../configs/imagekit");
const Story = require("../models/Story");
const User = require("../models/User");
const { inngest } = require("../inngest");
const { IMAGEKIT_URL_ENDPOINT } = require("../utils/constants");

const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;
    let media_url = "";

    // upload media to imagekit
    if (media_type === "image" || media_type === "video") {
      //const fileBuffer = fs.readFileSync(media.path);
      const base64File = media.buffer.toString("base64");
      const response = await imagekit.files.upload({
        file: base64File,
        fileName: media.originalname,
        folder: "stories",
      });

      media_url =
        media_type === "image"
          ? imagekit.helper.buildSrc({
              src: response.filePath,
              urlEndpoint: IMAGEKIT_URL_ENDPOINT,
              transformation: [
                { quality: "auto", format: "webp", width: "1280" },
              ],
            })
          : response.url;
    }

    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    // delete story after 24 hours
    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
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
