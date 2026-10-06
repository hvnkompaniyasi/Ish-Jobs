/**
 * Async controller'larni o'rash uchun wrapper.
 * try/catch yozmasdan xatolarni keyingi middleware'ga uzatadi.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
