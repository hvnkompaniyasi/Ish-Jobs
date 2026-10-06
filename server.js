/**
 * Server kirish nuqtasi.
 */

const app = require('./src/app');
const env = require('./src/configs/env');
const logger = require('./src/configs/logger');
const { connectDB, disconnectDB } = require('./src/configs/db');

let server;

async function start() {
  logger.info('Ishjobs server ishga tushirilmoqda...');

  // MongoDB'ga ulanish (muvaffaqiyatsiz bo'lsa ham davom etamiz)
  await connectDB();

  // HTTP serverni ishga tushirish
  server = app.listen(env.PORT, () => {
    logger.success(`Server ishga tushdi: http://localhost:${env.PORT}`);
    logger.info(`Muhit: ${env.NODE_ENV}`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
  });
}

async function shutdown(signal) {
  logger.warn(`${signal} signali qabul qilindi. Toza ochirilmoqda...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server yopildi');
      await disconnectDB();
      logger.info('Xayr!');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    logger.error('Toza ochirish vaqti tugadi, majburiy chiqilmoqda');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  shutdown('uncaughtException');
});

start();
