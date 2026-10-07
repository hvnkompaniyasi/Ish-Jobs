const mongoose = require('mongoose');
const { Resume } = require('../models');
const ApiError = require('../utils/ApiError');

async function createResume(data, user) {
  const payload = { ...data, user: user._id };

  if (payload.isPrimary) {
    await Resume.updateMany(
      { user: user._id, isPrimary: true },
      { $set: { isPrimary: false } }
    );
  }

  const count = await Resume.countDocuments({ user: user._id });
  if (count === 0) payload.isPrimary = true;

  const resume = await Resume.create(payload);
  return resume;
}

async function getMyResumes(user) {
  const resumes = await Resume.find({ user: user._id })
    .sort({ isPrimary: -1, createdAt: -1 })
    .populate('user', 'firstName lastName email phone');
  return resumes;
}

async function getResumeById(id, currentUser) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Rezyume ID notogri');
  }

  const resume = await Resume.findById(id).populate(
    'user',
    'firstName lastName email phone avatar company'
  );

  if (!resume) throw new ApiError(404, 'Rezyume topilmadi');

  const isOwner = resume.user._id.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === 'admin';

  if (!resume.isPublic && !isOwner && !isAdmin) {
    throw new ApiError(403, 'Bu rezyumeni korish huquqi yoq');
  }

  return resume;
}

async function updateResume(id, data, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Rezyume ID notogri');
  }

  const resume = await Resume.findById(id);
  if (!resume) throw new ApiError(404, 'Rezyume topilmadi');

  if (resume.user.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Bu rezyumeni ozgartirish huquqi yoq');
  }

  if (data.isPrimary === true && !resume.isPrimary) {
    await Resume.updateMany(
      { user: user._id, isPrimary: true, _id: { $ne: resume._id } },
      { $set: { isPrimary: false } }
    );
  }

  const allowed = [
    'title', 'about', 'audioUrl', 'audioTranscript', 'skills',
    'experience', 'education', 'languages', 'expectedSalary',
    'location', 'isPublic', 'isPrimary',
  ];

  allowed.forEach((key) => {
    if (data[key] !== undefined) resume[key] = data[key];
  });

  await resume.save();
  return resume;
}

async function deleteResume(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Rezyume ID notogri');
  }

  const resume = await Resume.findById(id);
  if (!resume) throw new ApiError(404, 'Rezyume topilmadi');

  if (resume.user.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'Bu rezyumeni ochirish huquqi yoq');
  }

  const wasPrimary = resume.isPrimary;
  await resume.deleteOne();

  if (wasPrimary) {
    const next = await Resume.findOne({ user: user._id }).sort({ createdAt: -1 });
    if (next) {
      next.isPrimary = true;
      await next.save({ validateBeforeSave: false });
    }
  }

  return { id };
}

module.exports = { createResume, getMyResumes, getResumeById, updateResume, deleteResume };
