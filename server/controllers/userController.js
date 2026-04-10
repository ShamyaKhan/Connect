const User = require("../models/User");

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
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = { getUserData, updateUserData };
