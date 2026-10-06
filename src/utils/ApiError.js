/**
 * API xatolari uchun custom klass.
 * Barcha kutilgan xatolar shu klass orqali chiqariladi.
 *
 * Misol:
 *   throw new ApiError(404, 'Foydalanuvchi topilmadi');
 */

class ApiError extends Error {
  constructor(statusCode, message = 'Xato yuz berdi', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
