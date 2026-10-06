/**
 * Auth controller — HTTP qatlami.
 */

const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Muvaffaqiyatli royxatdan otdingiz'));
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(new ApiResponse(200, result, 'Tizimga kirdingiz'));
});

/**
 * POST /api/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.status(200).json(new ApiResponse(200, tokens, 'Token yangilandi'));
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'Refresh token kerak');
  await authService.logout(req.user._id, refreshToken);
  res.status(200).json(new ApiResponse(200, null, 'Chiqdingiz'));
});

/**
 * GET /api/auth/me
 */
const me = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, 'Profil malumotlari'));
});

module.exports = { register, login, refresh, logout, me };
