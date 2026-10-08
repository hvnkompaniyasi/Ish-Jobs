/**
 * Cloudflare R2 — S3-mos keladigan konfiguratsiya.
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const env = require('./env');
const logger = require('./logger');

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Buffer'ni R2'ga yuklash.
 * @param {Buffer} buffer
 * @param {string} key - R2'dagi fayl yo'li (masalan: avatars/userId/123.jpg)
 * @param {string} contentType - image/jpeg, image/png, ...
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadBuffer(buffer, key, contentType = 'image/jpeg') {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  try {
    await r2.send(command);
    return {
      url: `${env.R2_PUBLIC_URL}/${key}`,
      publicId: key,
    };
  } catch (err) {
    logger.error('R2 upload error:', err);
    throw new Error('R2 yuklashda xatolik');
  }
}

/**
 * R2'dan faylni o'chirish.
 */
async function deleteImage(key) {
  if (!key) return;
  try {
    await r2.send(new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }));
  } catch (err) {
    logger.error('R2 delete error:', err.message);
  }
}

module.exports = { r2, uploadBuffer, deleteImage };
