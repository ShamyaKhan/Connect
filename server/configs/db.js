const mongoose = require("mongoose");
const { MONGODB_URI } = require("../utils/constants");

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to database!");
    });
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.log(`Could not connect to database! ${err.message}`);
  }
};

module.exports = connectDB;
