/**
 * Notification biznes-logikasi.
 */

const mongoose = require('mongoose');
const { Notification } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Yangi xabarnoma yaratish (ichki ishlatish uchun).
 */
async function createNotification(data) {
  const notification = await Notification.create(data);
  return notification;
}

/**
 * Foydalanuvchining xabarnomalari ro'yxati.
 */
async function getMyNotifications(user, pagination = {}) {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { recipient: user._id };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName avatarUrl'),
    Notification.countDocuments(query),
    Notification.countDocuments({ ...query, read: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Bitta xabarnomani o'qilgan deb belgilash.
 */
async function markAsRead(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Xabarnoma ID notogri');
  }

  const notification = await Notification.findById(id);
  if (!notification) throw new ApiError(404, 'Xabarnoma topilmadi');
  if (notification.recipient.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Ruxsat yoq');
  }

  if (!notification.read) {
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
}

/**
 * Barcha xabarnomalarni o'qilgan deb belgilash.
 */
async function markAllAsRead(user) {
  await Notification.updateMany(
    { recipient: user._id, read: false },
    { $set: { read: true, readAt: new Date() } }
  );
  return { updated: true };
}

/**
 * Xabarnomani o'chirish.
 */
async function deleteNotification(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Xabarnoma ID notogri');
  }

  const notification = await Notification.findById(id);
  if (!notification) throw new ApiError(404, 'Xabarnoma topilmadi');
  if (notification.recipient.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Ruxsat yoq');
  }

  await notification.deleteOne();
  return { id };
}

/**
 * O'qilmagan xabarnomalar soni.
 */
async function getUnreadCount(user) {
  const count = await Notification.countDocuments({
    recipient: user._id,
    read: false,
  });
  return { count };
}

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
