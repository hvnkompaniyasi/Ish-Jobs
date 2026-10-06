/**
 * Markazlashtirilgan logger.
 * - Dev muhitda: rangli va o'qish oson
 * - Prod muhitda: JSON formatda (log agregatorlar uchun)
 */

const env = require('./env');

// ANSI ranglar (terminal uchun)
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const levelColors = {
  INFO: colors.cyan,
  WARN: colors.yellow,
  ERROR: colors.red,
  DEBUG: colors.gray,
  SUCCESS: colors.green,
};

/**
 * Vaqtni formatlash: 2025-10-06 14:32:10
 */
function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Asosiy log funksiyasi.
 */
function log(level, message, meta) {
  const ts = timestamp();

  if (env.isProd) {
    // Production: JSON
    console.log(
      JSON.stringify({
        timestamp: ts,
        level,
        message,
        ...(meta ? { meta } : {}),
      })
    );
    return;
  }

  // Development: rangli
  const color = levelColors[level] || colors.reset;
  const tag = `${color}[${level}]${colors.reset}`;
  const time = `${colors.gray}${ts}${colors.reset}`;

  if (meta !== undefined && meta !== null) {
    console.log(`${time} ${tag} ${message}`, meta);
  } else {
    console.log(`${time} ${tag} ${message}`);
  }
}

const logger = {
  info: (msg, meta) => log('INFO', msg, meta),
  warn: (msg, meta) => log('WARN', msg, meta),
  error: (msg, meta) => log('ERROR', msg, meta),
  debug: (msg, meta) => {
    if (!env.isProd) log('DEBUG', msg, meta);
  },
  success: (msg, meta) => log('SUCCESS', msg, meta),
};

module.exports = logger;
