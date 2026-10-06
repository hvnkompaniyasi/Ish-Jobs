/**
 * Auth biznes-logikasi.
 */

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password.util');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/token.util');

/**
 * Token juftligini yaratish va refresh tokenni bazaga saqlash.
 */
async function issueTokens(user) {
  const payload = { userId: user._id.toString(), role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        $each: [{ token: refreshToken, expiresAt }],
        $slice: -5,
      },
    },
  });

  return { accessToken, refreshToken };
}

/**
 * Yangi foydalanuvchi ro'yxatdan o'tkazish.
 */
async function register(data) {
  const { firstName, lastName, email, password, phone, role, company } = data;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Bu email allaqachon royxatdan otgan');
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone: phone || null,
    password: hashedPassword,
    role: role || 'seeker',
    company: role === 'employer' && company ? company : undefined,
  });

  const tokens = await issueTokens(user);

  user.password = undefined;

  return { user, ...tokens };
}

/**
 * Tizimga kirish.
 */
async function login(email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, 'Email yoki parol notogri');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Hisob faol emas');
  }

  if (!user.password) {
    throw new ApiError(500, 'Parol topilmadi - baza muammosi');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Email yoki parol notogri');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = await issueTokens(user);

  user.password = undefined;

  return { user, ...tokens };
}

/**
 * Refresh token orqali yangi access token olish.
 */
async function refresh(refreshToken) {
  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'Foydalanuvchi topilmadi');
    }

    const stored = user.refreshTokens.find((t) => t.token === refreshToken);
    if (!stored) {
      throw new ApiError(401, 'Refresh token yaroqsiz');
    }

    const tokens = await issueTokens(user);

    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: { token: refreshToken } },
    });

    return tokens;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Refresh token yaroqsiz yoki muddati otgan');
  }
}

/**
 * Chiqish.
 */
async function logout(userId, refreshToken) {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { token: refreshToken } },
  });
}

module.exports = { register, login, refresh, logout };
