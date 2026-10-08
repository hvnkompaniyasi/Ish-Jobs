const notificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getMyNotifications(req.user, {
    page: req.query.page,
    limit: req.query.limit,
  });
  res.status(200).json(new ApiResponse(200, result, 'Xabarnomalar olindi'));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user);
  res.status(200).json(new ApiResponse(200, result, 'Oqilmagan soni'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Oqilgan deb belgilandi'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user);
  res.status(200).json(new ApiResponse(200, result, 'Hammasi oqilgan'));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Xabarnoma ochirildi'));
});

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
