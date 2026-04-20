const express = require("express");
const cors = require("cors");
const { PORT } = require("./utils/constants");
const connectDB = require("./configs/db");
const { inngest, functions } = require("./inngest/index");
const { serve } = require("inngest/express");
const { clerkMiddleware } = require("@clerk/express");
const userRouter = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const storyRouter = require("./routes/storyRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("Homepage");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (err) {
    console.log(err.message);
  }
};

startServer();
