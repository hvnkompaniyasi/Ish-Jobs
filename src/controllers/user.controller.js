const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');
const uploadService = require('../services/upload.service');

/**
 * POST /api/users/avatar
 * Form-data: avatar (file)
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Rasm fayli kerak');

  const { url, publicId } = await uploadService.uploadAvatar(
    req.file,
    req.user._id.toString()
  );

  // Eski avatarni o'chirish
  if (req.user.avatarPublicId) {
    await uploadService.deleteImage(req.user.avatarPublicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: url, avatarPublicId: publicId },
    { new: true }
  );

  user.password = undefined;
  res.status(200).json(new ApiResponse(200, user, 'Avatar yangilandi'));
});

module.exports = { uploadAvatar };
