/**
 * Application biznes-logikasi (AI'siz — hozircha).
 */

const mongoose = require('mongoose');
const { Application, Job, Resume } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Yangi ariza yuborish (seeker).
 */
async function createApplication(applicantId, data) {
  const { job: jobId, resume: resumeId, coverLetter } = data;

  // 1. Vakansiya mavjudligini tekshirish
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Vakansiya topilmadi');
  }
  if (job.status !== 'active') {
    throw new ApiError(400, 'Bu vakansiya faol emas');
  }

  // 2. Rezyume mavjudligini va egasi ekanligini tekshirish
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new ApiError(404, 'Rezyume topilmadi');
  }
  if (resume.user.toString() !== applicantId.toString()) {
    throw new ApiError(403, 'Bu rezyume sizga tegishli emas');
  }

  // 3. Allaqachon ariza berilmaganligini tekshirish
  const existing = await Application.findOne({
    applicant: applicantId,
    job: jobId,
  });
  if (existing) {
    throw new ApiError(409, 'Siz bu vakansiyaga allaqachon ariza bergansiz');
  }

  // 4. Ariza yaratish
  const application = await Application.create({
    applicant: applicantId,
    resume: resumeId,
    job: jobId,
    coverLetter: coverLetter || null,
    status: 'pending',
  });

  // 5. Vakansiya statistikasini yangilash
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  return application;
}

/**
 * Seekerning o'z arizalari.
 */
async function getMyApplications(applicantId, query) {
  const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const filter = { applicant: applicantId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('job', 'title company.name location city salary status employer')
      .populate('resume', 'title')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

/**
 * Vakansiyaga kelgan arizalar (faqat vakansiya egasi — employer).
 */
async function getJobApplications(jobId, employerId, query) {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, 'Notogri vakansiya ID');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Vakansiya topilmadi');
  }
  if (job.employer.toString() !== employerId.toString()) {
    throw new ApiError(403, 'Bu vakansiya sizga tegishli emas');
  }

  const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const filter = { job: jobId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('applicant', 'firstName lastName email phone')
      .populate('resume')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

/**
 * Bitta arizani olish (applicant yoki employer).
 */
async function getApplicationById(applicationId, userId) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const application = await Application.findById(applicationId)
    .populate('applicant', 'firstName lastName email phone')
    .populate('resume')
    .populate({
      path: 'job',
      populate: { path: 'employer', select: 'firstName lastName company.name' },
    });

  if (!application) {
    throw new ApiError(404, 'Ariza topilmadi');
  }

  // Ruxsat: applicant yoki vakansiya egasi ko'ra oladi
  const isApplicant = application.applicant._id.toString() === userId.toString();
  const isEmployer =
    application.job.employer._id.toString() === userId.toString();

  if (!isApplicant && !isEmployer) {
    throw new ApiError(403, 'Bu arizani korishga ruxsat yoq');
  }

  // Employer ko'rsa — viewedAt belgilash
  if (isEmployer && !application.viewedAt) {
    application.viewedAt = new Date();
    await application.save({ validateBeforeSave: false });
  }

  return application;
}

/**
 * Ariza statusini o'zgartirish (faqat employer).
 */
async function updateApplicationStatus(applicationId, employerId, data) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const application = await Application.findById(applicationId).populate('job');
  if (!application) {
    throw new ApiError(404, 'Ariza topilmadi');
  }

  if (application.job.employer.toString() !== employerId.toString()) {
    throw new ApiError(403, 'Bu ariza sizning vakansiyangizga tegishli emas');
  }

  application.status = data.status;
  if (data.employerNote !== undefined) {
    application.employerNote = data.employerNote;
  }
  application.respondedAt = new Date();

  await application.save();
  return application;
}

/**
 * Arizani bekor qilish (faqat applicant, faqat pending).
 */
async function withdrawApplication(applicationId, applicantId) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new ApiError(404, 'Ariza topilmadi');
  }

  if (application.applicant.toString() !== applicantId.toString()) {
    throw new ApiError(403, 'Bu ariza sizga tegishli emas');
  }

  if (application.status !== 'pending') {
    throw new ApiError(400, 'Faqat kutilayotgan arizalarni bekor qilish mumkin');
  }

  // Vakansiya statistikasini kamaytirish
  await Job.findByIdAndUpdate(application.job, {
    $inc: { applicationsCount: -1 },
  });

  await application.deleteOne();
  return { deleted: true };
}

module.exports = {
  createApplication,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
};
