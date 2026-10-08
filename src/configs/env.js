/**
 * Muhit o'zgaruvchilarini markazlashtirilgan holda o'qish va tekshirish.
 * Butun loyihada faqat shu fayldan env qiymatlarini olamiz.
 * Agar majburiy o'zgaruvchi yo'q bo'lsa — server ishga tushmaydi (fail-fast).
 */

require('dotenv').config();

/**
 * Majburiy env o'zgaruvchini tekshiradi.
 * @param {string} key - env nomi
 * @returns {string} - qiymat
 */
function required(key) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`❌ Muhim muhit o'zgaruvchisi topilmadi: ${key}`);
  }
  return value;
}

/**
 * Ixtiyoriy env o'zgaruvchi (default qiymat bilan).
 */
function optional(key, fallback) {
  return process.env[key] && process.env[key].trim() !== ''
    ? process.env[key]
    : fallback;
}

const env = {
  // ============ SERVER ============
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '5000'), 10),
  API_PREFIX: optional('API_PREFIX', '/api'),
  isProd: optional('NODE_ENV', 'development') === 'production',

  // ============ MONGODB ============
  MONGO_URI: required('MONGO_URI'),

  // ============ JWT ============
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  // ============ DEEPSEEK AI ============
  DEEPSEEK_API_KEY: optional('DEEPSEEK_API_KEY', ''),
  DEEPSEEK_FLASH_MODEL: optional('DEEPSEEK_FLASH_MODEL', 'deepseek-chat'),
  DEEPSEEK_R1_MODEL: optional('DEEPSEEK_R1_MODEL', 'deepseek-reasoner'),
  DEEPSEEK_BASE_URL: optional('DEEPSEEK_BASE_URL', 'https://api.deepseek.com'),

  // ============ WHISPER ============
  OPENAI_API_KEY: optional('OPENAI_API_KEY', ''),
  WHISPER_MODEL: optional('WHISPER_MODEL', 'whisper-1'),

  // ============ AISHA AI ============
  AISHA_API_KEY: optional('AISHA_API_KEY', ''),
  AISHA_BASE_URL: optional('AISHA_BASE_URL', 'https://api.aisha.ai/v1'),

  // ============ TELEGRAM ============
  TELEGRAM_BOT_TOKEN: optional('TELEGRAM_BOT_TOKEN', ''),
  TELEGRAM_ADMIN_IDS: optional('TELEGRAM_ADMIN_IDS', '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),

  // ============ SECURITY ============
  BCRYPT_SALT_ROUNDS: parseInt(optional('BCRYPT_SALT_ROUNDS', '12'), 10),
  RATE_LIMIT_WINDOW_MS: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  CORS_ORIGIN: optional('CORS_ORIGIN', '*'),

  // ============ UPLOAD ============
  MAX_FILE_SIZE_MB: parseInt(optional('MAX_FILE_SIZE_MB', '10'), 10),
  UPLOAD_DIR: optional('UPLOAD_DIR', 'uploads'),
};

module.exports = env;

// ═══════════ CLOUDFLARE R2 ═══════════
module.exports.R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
module.exports.R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
module.exports.R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
module.exports.R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
module.exports.R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
