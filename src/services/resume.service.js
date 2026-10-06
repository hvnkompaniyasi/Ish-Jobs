/**
 * Resume biznes-logikasi (AI'siz, faqat matnli).
 */

const mongoose = require('mongoose');
const { Resume } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Yangi rezyume yaratish.
 * Agar isPrimary=true bo'lsa, boshqa rezyumelardan olib tashlanadi.
 */
async function createResume(userId, data) {
  // Agar isPrimary=true bo'lsa — eskilarini pasaytiramiz
  if (data.isPrimary) {
    await Resume.updateMany(
      { user: userId, isPrimary: true },
      { $set: { isPrimary: false } }
    );
  }

  const resume = await Resume.create({
    ...data,
    user: userId,
  });

  return resume;
}

/**
 * Public rezyumelar ro'yxati (filter, pagination, sort).
 */
async function listResumes(query) {
  const {
    page = 1,
    limit = 20,
    search,
    skills,
    location,
    minExperience,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = { isPublic: true };

  if (location) filter.location = new RegExp(location, 'i');
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillList.length > 0) filter.skills = { $in: skillList };
  }

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [resumes, total] = await Promise.all([
    Resume.find(filter)
      .select('-embedding -audioTranscript')
      .populate('user', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Resume.countDocuments(filter),
  ]);

  // minExperience filtrini JS'da qo'llaymiz (virtual)
  let filtered = resumes;
  if (typeof minExperience === 'number') {
    filtered = resumes.filter((r) => {
      // Tajriba yillarini hisoblash
      let totalMonths = 0;
      for (const exp of r.experience || []) {
        const start = new Date(exp.startDate);
        const end = exp.current ? new Date() : new Date(exp.endDate || new Date());
        totalMonths += (end - start) / (1000 * 60 * 60 * 24 * 30);
      }
      const years = totalMonths / 12;
      return years >= minExperience;
    });
  }

  return {
    resumes: filtered,
    pagination: {
      page,
      limit,
      total: typeof minExperience === 'number' ? filtered.length : total,
      pages: Math.ceil(
        (typeof minExperience === 'number' ? filtered.length : total) / limit
      ),
    },
  };
}

/**
 * Bitta rezyumeni olish.
 */
async function getResumeById(resumeId) {
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const resume = await Resume.findById(resumeId)
    .select('-embedding')
    .populate('user', 'firstName lastName email');

  if (!resume) {
    throw new ApiError(404, 'Rezyume topilmadi');
  }

  return resume;
}

/**
 * Rezyumeni tahrirlash (faqat egasi).
 */
async function updateResume(resumeId, userId, updates) {
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new ApiError(404, 'Rezyume topilmadi');
  }

  if (resume.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'Bu rezyume sizga tegishli emas');
  }

  // isPrimary=true bo'lsa eskilarini pasaytirish
  if (updates.isPrimary === true) {
    await Resume.updateMany(
      { user: userId, isPrimary: true, _id: { $ne: resumeId } },
      { $set: { isPrimary: false } }
    );
  }

  Object.assign(resume, updates);
  await resume.save();

  return resume;
}

/**
 * Rezyumeni o'chirish (faqat egasi).
 */
async function deleteResume(resumeId, userId) {
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new ApiError(404, 'Rezyume topilmadi');
  }

  if (resume.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'Bu rezyume sizga tegishli emas');
  }

  await resume.deleteOne();
  return { deleted: true };
}

/**
 * Foydalanuvchining o'z rezyumelari.
 */
async function getMyResumes(userId, query) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    Resume.find({ user: userId })
      .select('-embedding')
      .sort({ isPrimary: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Resume.countDocuments({ user: userId }),
  ]);

  return {
    resumes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

module.exports = {
  createResume,
  listResumes,
  getResumeById,
  updateResume,
  deleteResume,
  getMyResumes,
};
