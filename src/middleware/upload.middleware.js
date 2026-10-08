/**
 * Multer — fayllarni xotirada qabul qilish.
 * Faqat rasm: jpeg, jpg, png, webp. Max 3 MB.
 */

const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 3 * 1024 * 1024; // 3 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Faqat JPEG, PNG yoki WEBP qabul qilinadi'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
const uploadSingle = (fieldName) => upload.single(fieldName);

module.exports = { upload, uploadSingle };
