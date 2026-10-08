/**
 * Fayl yuklash servisi (Cloudflare R2).
 */

const { uploadBuffer, deleteImage } = require('../configs/r2');
const ApiError = require('../utils/ApiError');

/**
 * Fayl kengaytmasini olish.
 */
function getExtension(originalname = '') {
  const parts = originalname.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';
}

/**
 * Avatar yuklash.
 */
async function uploadAvatar(file, userId) {
  if (!file) throw new ApiError(400, 'Rasm fayli kerak');

  const ext = getExtension(file.originalname);
  const key = `avatars/${userId}/${Date.now()}.${ext}`;
  return uploadBuffer(file.buffer, key, file.mimetype);
}

/**
 * Kompaniya logotipini yuklash.
 */
async function uploadCompanyLogo(file, userId) {
  if (!file) throw new ApiError(400, 'Logotip fayli kerak');

  const ext = getExtension(file.originalname);
  const key = `logos/${userId}/${Date.now()}.${ext}`;
  return uploadBuffer(file.buffer, key, file.mimetype);
}

module.exports = { uploadAvatar, uploadCompanyLogo, deleteImage };
