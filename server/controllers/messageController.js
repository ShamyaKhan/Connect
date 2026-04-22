const fs = require("fs");
const imagekit = require("../configs/imagekit");
const { IMAGEKIT_URL_ENDPOINT } = require("../utils/constants");
const Message = require("../models/Message");

const connections = {};

// controller for SSE endpoint
const sseController = async (req, res) => {
  const { userId } = req.params;
  console.log("New client connected:", userId);

  // set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // add client's response object to connection object
  connections[userId] = res;

  // send an initial event to client
  res.write("Log: Connected to SSE stream\n\n");

  // handle client disconnect
  req.on("close", () => {
    // remove client's response object from connection array
    delete connections[userId];
    console.log("Client disconnected");
  });
};

const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (message_type === "image") {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imagekit.files.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });

      media_url = imagekit.helper.buildSrc({
        url_endpoint: IMAGEKIT_URL_ENDPOINT,
        src: response.filepath,
        transformation: [{ quality: "auto", format: "webp", width: "1280" }],
      });
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    res.json({ success: true, message });

    // send message to receiver using SSE
    const messageWithUserData = Message.findById(message._id).populate(
      "from_user_id",
    );

    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messageWithUserData)}\n\n`,
      );
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: -1 });

    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { seen: true },
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getRecentUserMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const messages = await Message.find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = {
  sseController,
  sendMessage,
  getChatMessages,
  getRecentUserMessages,
};
