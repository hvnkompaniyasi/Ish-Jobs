/**
 * Rolga qarab ruxsat berish middleware.
 * Misol: authorize('employer'), authorize('admin', 'employer')
 */

const ApiError = require('../utils/ApiError');

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Avtorizatsiya kerak'));
  }
  if (!roles.includes(req.user.role)) {
    return next(
      new ApiError(403, `Bu amal uchun ruxsat yoq. Kerakli rol: ${roles.join(' yoki ')}`)
    );
  }
  next();
};

module.exports = { authorize };
