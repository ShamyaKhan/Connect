const ImageKit = require("@imagekit/nodejs");
const { IMAGEKIT_PRIVATE_KEY } = require("../utils/constants");

const client = new ImageKit({
  privateKey: IMAGEKIT_PRIVATE_KEY, // This is the default and can be omitted
});

const response = await client.files.upload({
  file: fs.createReadStream("path/to/file"),
  fileName: "file-name.jpg",
});

console.log(response);
