const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Muvaffaqiyatli royxatdan otdingiz'));
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const result = await authService.login(identifier, password);
  res.status(200).json(new ApiResponse(200, result, 'Tizimga kirdingiz'));
});

const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.status(200).json(new ApiResponse(200, tokens, 'Token yangilandi'));
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'Refresh token kerak');
  await authService.logout(req.user._id, refreshToken);
  res.status(200).json(new ApiResponse(200, null, 'Chiqdingiz'));
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'Profil malumotlari'));
});

const switchRole = asyncHandler(async (req, res) => {
  const user = await authService.switchRole(req.user._id, req.body.role);
  res.status(200).json(new ApiResponse(200, user, `Rejim ozgartirildi: ${req.body.role}`));
});

/**
 * DELETE /api/auth/me
 * Hisobni butunlay o'chirish (parol bilan tasdiqlanadi)
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const result = await authService.deleteAccount(req.user._id, password);
  res.status(200).json(new ApiResponse(200, result, 'Hisob butunlay ochirildi'));
});

module.exports = { register, login, refresh, logout, me, switchRole, deleteAccount };

/**
 * PATCH /api/auth/me — Profilni yangilash
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'Profil yangilandi'));
});

/**
 * PATCH /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user._id, oldPassword, newPassword);
  res.status(200).json(new ApiResponse(200, result, 'Parol ozgartirildi'));
});

module.exports.updateProfile = updateProfile;
module.exports.changePassword = changePassword;
