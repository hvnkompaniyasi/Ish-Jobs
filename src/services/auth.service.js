const { User, Job, Resume, Application } = require('../models');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password.util');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/token.util');

async function issueTokens(user) {
  const payload = {
    userId: user._id.toString(),
    role: user.activeRole || user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: { $each: [{ token: refreshToken, expiresAt }], $slice: -5 },
    },
  });
  return { accessToken, refreshToken };
}

async function register(data) {
  const { firstName, lastName, phone, email, password, role, company } = data;

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) throw new ApiError(409, 'Bu telefon raqam allaqachon royxatdan otgan');

  if (email) {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new ApiError(409, 'Bu email allaqachon royxatdan otgan');
  }

  const hashedPassword = await hashPassword(password);
  const initialRole = role || 'seeker';

  const user = await User.create({
    firstName, lastName, phone,
    email: email || undefined,
    password: hashedPassword,
    role: initialRole,
    roles: [initialRole],
    activeRole: initialRole,
    company: initialRole === 'employer' && company ? company : undefined,
  });

  const tokens = await issueTokens(user);
  user.password = undefined;
  return { user, ...tokens };
}

async function login(identifier, password) {
  if (!identifier) throw new ApiError(400, 'Telefon raqam yoki email kerak');

  const isPhone = /^\+?\d{9,15}$/.test(identifier.trim());
  const query = isPhone
    ? { phone: identifier.trim() }
    : { email: identifier.toLowerCase().trim() };

  const user = await User.findOne(query);
  if (!user) throw new ApiError(401, 'Telefon/email yoki parol notogri');
  if (!user.isActive) throw new ApiError(403, 'Hisob faol emas');
  if (!user.password) throw new ApiError(500, 'Parol topilmadi');

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Telefon/email yoki parol notogri');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = await issueTokens(user);
  user.password = undefined;
  return { user, ...tokens };
}

async function refresh(refreshToken) {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);
    if (!user) throw new ApiError(401, 'Foydalanuvchi topilmadi');

    const stored = user.refreshTokens.find((t) => t.token === refreshToken);
    if (!stored) throw new ApiError(401, 'Refresh token yaroqsiz');

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

async function logout(userId, refreshToken) {
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { token: refreshToken } },
  });
}

async function switchRole(userId, newRole) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'Foydalanuvchi topilmadi');
  if (!['seeker', 'employer'].includes(newRole)) {
    throw new ApiError(400, 'Faqat seeker yoki employer rejimiga otish mumkin');
  }
  if (user.activeRole === newRole) {
    user.password = undefined;
    return user;
  }
  if (!user.roles.includes(newRole)) user.roles.push(newRole);
  user.activeRole = newRole;
  user.role = newRole;
  await user.save({ validateBeforeSave: false });
  user.password = undefined;
  return user;
}

/**
 * Hisobni BUTUNLAY o'chirish (cascade delete).
 * - Parol bilan tasdiqlanadi
 * - User'ning barcha Job, Resume, Application yozuvlari o'chiriladi
 */
async function deleteAccount(userId, password) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'Foydalanuvchi topilmadi');

  // Parolni tasdiqlash
  if (!password) throw new ApiError(400, 'Parolni kiritish shart');
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Parol notogri');

  // 1. Foydalanuvchining vakansiyalarini topish (arizalarni ham o'chirish uchun)
  const userJobs = await Job.find({ employer: userId }).select('_id').lean();
  const userJobIds = userJobs.map((j) => j._id);

  // 2. Bog'liq ma'lumotlarni parallel o'chirish
  const deletions = [
    Job.deleteMany({ employer: userId }),
    Resume.deleteMany({ user: userId }),
  ];

  if (Application) {
    deletions.push(
      Application.deleteMany({
        $or: [
          { applicant: userId },
          ...(userJobIds.length > 0 ? [{ job: { $in: userJobIds } }] : []),
        ],
      })
    );
  }

  await Promise.all(deletions);

  // 3. Foydalanuvchini o'chirish
  await User.findByIdAndDelete(userId);

  return { deleted: true, userId };
}

module.exports = { register, login, refresh, logout, switchRole, deleteAccount };

/**
 * Profilni yangilash (ism, familiya).
 */
async function updateProfile(userId, data) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'Foydalanuvchi topilmadi');

  if (data.firstName) user.firstName = data.firstName.trim();
  if (data.lastName) user.lastName = data.lastName.trim();

  await user.save();
  user.password = undefined;
  return user;
}

/**
 * Parolni o'zgartirish.
 */
async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'Foydalanuvchi topilmadi');

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) throw new ApiError(401, 'Eski parol notogri');

  if (oldPassword === newPassword) {
    throw new ApiError(400, 'Yangi parol eskisidan farq qilishi kerak');
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return { updated: true };
}

module.exports.updateProfile = updateProfile;
module.exports.changePassword = changePassword;
