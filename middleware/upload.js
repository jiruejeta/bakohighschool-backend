const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'explanationVideoFile') {
      return {
        folder: 'bako-high-school/questions/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
      };
    }
    return {
      folder: 'bako-high-school/questions/images',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'explanationVideoFile') {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Explanation video must be a valid video file'), false);
    }
  } else {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error(`${file.fieldname} must be a valid image file`), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 80 * 1024 * 1024 }, // 50MB max
});

const questionUpload = upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'explanationImage', maxCount: 1 },
  { name: 'explanationVideoFile', maxCount: 1 },
]);

const bulkVideoUpload = upload.fields([{ name: 'explanationVideoFile', maxCount: 1 }]);

module.exports = { questionUpload, bulkVideoUpload };