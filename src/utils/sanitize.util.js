/**
 * Kiruvchi ma'lumotlarni tozalash.
 */

function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const cleaned = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    cleaned[key] = sanitizeObject(obj[key]);
  }
  return cleaned;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = { sanitizeObject, escapeHtml };
