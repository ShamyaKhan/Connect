const { getAuth } = require("@clerk/express");

const protect = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.json({ success: false, message: "Not Authenticated!" });
    }

    next();
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = { protect };
