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
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
