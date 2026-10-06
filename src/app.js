/**
 * Express ilovasi.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./configs/env');
const logger = require('./configs/logger');
const routes = require('./routes');

const app = express();

// ============ XAVFSIZLIK ============
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// ============ PARSING ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ LOGGING ============
if (!env.isProd) {
  app.use(morgan('dev'));
}

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ============ API ROUTES ============
app.use(env.API_PREFIX, routes);

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Yo'l topilmadi: ${req.method} ${req.originalUrl}`,
  });
});

// ============ GLOBAL ERROR HANDLER ============
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server xatosi',
    errors: err.errors || [],
    ...(env.isProd ? {} : { stack: err.stack }),
  });
});

module.exports = app;
