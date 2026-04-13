const ImageKit = require("@imagekit/nodejs");
const { IMAGEKIT_PRIVATE_KEY } = require("../utils/constants");

const imagekit = new ImageKit({
  privateKey: IMAGEKIT_PRIVATE_KEY, // This is the default and can be omitted
});

module.exports = imagekit;
