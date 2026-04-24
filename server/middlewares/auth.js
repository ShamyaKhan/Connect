const { getAuth } = require("@clerk/express");

const protect = async (req, res, next) => {
  try {
    console.log("Authorization header:", req.headers.authorization);
    console.log("req.auth()", req.auth());
    const { userId } = req.auth();
    console.log("userId from middleware ", userId);

    if (!userId) {
      return res.json({ success: false, message: "Not Authenticated!" });
    }

    next();
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = { protect };
