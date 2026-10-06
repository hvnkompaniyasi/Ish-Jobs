/**
 * Auth middleware — JWT tokenni tekshirish.
 * - Tokenni Authorization header'dan oladi
 * - Verifikatsiya qiladi
 * - req.user ga foydalanuvchini o'rnatadi
 */

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/token.util');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Authorization: Bearer <token>
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Avtorizatsiya kerak');
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, 'Foydalanuvchi topilmadi');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Hisob faol emas');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Token yaroqsiz yoki muddati otgan');
  }
});

/**
 * Rolga qarab ruxsat berish.
 * Misol: authorize('employer'), authorize('admin', 'employer')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Avtorizatsiya kerak'));
  }
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Bu amal uchun ruxsat yoq'));
  }
  next();
};

module.exports = { protect, authorize };
