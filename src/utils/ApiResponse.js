/**
 * API muvaffaqiyatli javoblari uchun standart klass.
 *
 * Misol:
 *   return res.status(200).json(
 *     new ApiResponse(200, userData, 'Foydalanuvchi olindi')
 *   );
 */

class ApiResponse {
  constructor(statusCode, data = null, message = 'Muvaffaqiyatli') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
