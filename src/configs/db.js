/**
 * MongoDB (Mongoose) ulanish moduli.
 * - Retry mexanizmi bilan (tarmoq uzilsa qayta urinadi)
 * - Server avtomatik ishga tushmasin xatolikda (faqat ogohlantiradi)
 */

const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

mongoose.set('strictQuery', true);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000; // 3 sekund

/**
 * Kutish (sleep).
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * MongoDB'ga ulanish (retry bilan).
 */
async function connectDB(retryCount = 1) {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // 15 sek
      socketTimeoutMS: 60000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      retryWrites: true,
    });

    logger.success(`MongoDB ulanish muvaffaqiyatli: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error(
      `MongoDB ulanish xatosi (urinish ${retryCount}/${MAX_RETRIES}): ${err.message}`
    );

    if (retryCount < MAX_RETRIES) {
      logger.warn(`${RETRY_DELAY_MS / 1000} sekunddan keyin qayta urinamiz...`);
      await sleep(RETRY_DELAY_MS);
      return connectDB(retryCount + 1);
    }

    // Barcha urinishlar tugadi — faqat ogohlantiramiz, process.exit qilmaymiz
    logger.error('MongoDB ga ulanib bolmadi. Internet aloqasini tekshiring.');
    logger.warn('Server ishlashda davom etadi, ammo baza bilan ishlamaydi.');

    // 30 sekunddan keyin yana bir marta urinamiz (fon rejimida)
    setTimeout(() => {
      logger.info('MongoDB qayta ulanishga urinish...');
      connectDB(1).catch(() => {});
    }, 30000);

    return null;
  }
}

// ============ HODISALAR ============
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB ulanish uzildi');
});

mongoose.connection.on('reconnected', () => {
  logger.success('MongoDB qayta ulandi');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB xatosi:', err.message);
});

/**
 * MongoDB'ni toza yopish.
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB ulanish yopildi');
  } catch (err) {
    logger.error('MongoDB yopishda xato:', err.message);
  }
}

module.exports = { connectDB, disconnectDB };
