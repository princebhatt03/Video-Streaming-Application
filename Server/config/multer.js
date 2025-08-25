const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'live_stream_videos',
    resource_type: 'video',
  },
});

const upload = multer({ storage });

module.exports = upload;
