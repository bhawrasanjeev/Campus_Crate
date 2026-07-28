const { upload } = require("../config/cloudinary");
const uploadMiddleware = upload.single("image");
module.exports = uploadMiddleware;