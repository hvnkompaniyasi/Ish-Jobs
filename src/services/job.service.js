/**
 * Job biznes-logikasi.
 */

const mongoose = require('mongoose');
const { Job } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Yangi vakansiya yaratish (faqat employer).
 */
async function createJob(employerId, data) {
  // Employer ma'lumotlarini olish uchun company maydonini to'ldirish
  const jobData = {
    ...data,
    employer: employerId,
  };

  const job = await Job.create(jobData);

  return job;
}

/**
 * Vakansiyalar ro'yxati (filter, pagination, sort).
 */
async function listJobs(query) {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    employmentType,
    experienceLevel,
    city,
    isRemote,
    minSalary,
    status = 'active',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (employmentType) filter.employmentType = employmentType;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (typeof isRemote === 'boolean') filter['location.isRemote'] = isRemote;
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (minSalary) filter['salary.min'] = { $gte: minSalary };

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('employer', 'firstName lastName company.name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Bitta vakansiyani olish (ko'rishlar sonini oshiradi).
 */
async function getJobById(jobId) {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const job = await Job.findByIdAndUpdate(
    jobId,
    { $inc: { viewsCount: 1 } },
    { new: true }
  ).populate('employer', 'firstName lastName company.name');

  if (!job) {
    throw new ApiError(404, 'Vakansiya topilmadi');
  }

  return job;
}

/**
 * Vakansiyani tahrirlash (faqat egasi).
 */
async function updateJob(jobId, employerId, updates) {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Vakansiya topilmadi');
  }

  if (job.employer.toString() !== employerId.toString()) {
    throw new ApiError(403, 'Bu vakansiya sizga tegishli emas');
  }

  Object.assign(job, updates);
  await job.save();

  return job;
}

/**
 * Vakansiyani o'chirish (faqat egasi).
 */
async function deleteJob(jobId, employerId) {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, 'Notogri ID formati');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Vakansiya topilmadi');
  }

  if (job.employer.toString() !== employerId.toString()) {
    throw new ApiError(403, 'Bu vakansiya sizga tegishli emas');
  }

  await job.deleteOne();

  return { deleted: true };
}

/**
 * Employerning o'z vakansiyalari.
 */
async function getMyJobs(employerId, query) {
  const { page = 1, limit = 20, status } = query;
  const filter = { employer: employerId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

module.exports = {
  createJob,
  listJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
};
