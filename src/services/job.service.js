/**
 * Job biznes-logikasi.
 */

const mongoose = require('mongoose');
const { Job } = require('../models');
const ApiError = require('../utils/ApiError');
const { cache, PREFIXES, buildJobsListKey, invalidateJobCache } = require('../utils/cache');
const viewsBatcher = require('../utils/viewsBatcher');

/**
 * Yangi vakansiya yaratish.
 */
async function createJob(data, user) {
  const payload = {
    ...data,
    employer: user._id,
  };

  // Employer company'si mavjud bo'lsa, kompaniya nomini to'ldirish
  if (data.company) {
    payload.company = {
      ...data.company,
      name: data.company.name || (user.company && user.company.name) || undefined,
    };
  }

  const job = await Job.create(payload);
  invalidateJobCache(String(job._id));
  return job;
}

/**
 * Vakansiyalar ro'yxati (qidiruv, filter, pagination).
 */
async function getJobs(filters = {}, pagination = {}) {
  const cacheKey = buildJobsListKey(filters, pagination);
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const {
    search,
    category,
    employmentType,
    experienceLevel,
    city,
    isRemote,
    minSalary,
    maxSalary,
    sort = 'newest',
    status = 'active',
  } = filters;

  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;

  const sortMap = {
    newest: { createdAt: -1 },
    salary: { 'salary.max': -1, 'salary.min': -1, createdAt: -1 },
    views: { viewsCount: -1, createdAt: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const query = { status };

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (employmentType) query.employmentType = employmentType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (isRemote === true) query['location.isRemote'] = true;

  if (minSalary || maxSalary) {
    if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
  }

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('employer', 'firstName lastName email company avatar'),
    Job.countDocuments(query),
  ]);

  const result = {
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
  cache.set(cacheKey, result, 60);
  return result;
}

/**
 * Bitta vakansiyani olish (ixtiyoriy viewsCount +1).
 */
async function getJobById(id, incrementViews = false) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Vakansiya ID notogri');
  }

  const job = await Job.findById(id).populate(
    'employer',
    'firstName lastName email company avatar phone'
  );

  if (!job) {
    throw new ApiError(404, 'Vakansiya topilmadi');
  }

  if (incrementViews) {
    viewsBatcher.trackView(id);
  }

  return job;
}

/**
 * Vakansiyani yangilash (faqat egasi yoki admin).
 */
async function updateJob(id, data, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Vakansiya ID notogri');
  }

  const job = await Job.findById(id);
  if (!job) throw new ApiError(404, 'Vakansiya topilmadi');

  const isOwner = job.employer.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw new ApiError(403, 'Bu vakansiyani ozgartirish huquqi yoq');
  }

  const allowed = [
    'title',
    'description',
    'requirements',
    'responsibilities',
    'category',
    'skills',
    'employmentType',
    'experienceLevel',
    'salary',
    'location',
    'company',
    'deadline',
    'status',
  ];

  allowed.forEach((key) => {
    if (data[key] !== undefined) job[key] = data[key];
  });

  await job.save();
  invalidateJobCache(String(job._id));
  return job;
}

/**
 * Vakansiyani o'chirish (faqat egasi yoki admin).
 */
async function deleteJob(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Vakansiya ID notogri');
  }

  const job = await Job.findById(id);
  if (!job) throw new ApiError(404, 'Vakansiya topilmadi');

  const isOwner = job.employer.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw new ApiError(403, 'Bu vakansiyani ochirish huquqi yoq');
  }

  await job.deleteOne();
  invalidateJobCache(String(job._id));
  return { id };
}

/**
 * Employer o'z vakansiyalarini olish.
 */
async function getMyJobs(user, pagination = {}) {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { employer: user._id };

  const [jobs, total] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(query),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Xarita uchun yengil vakansiyalar ro'yxati.
 * Faqat koordinatali va aktiv vakansiyalar.
 */
async function getJobsForMap() {
  const cached = cache.get(PREFIXES.JOBS_MAP);
  if (cached) return cached;

  const jobs = await Job.find({
    status: 'active',
    'locationPoint.coordinates.0': { $exists: true },
  })
    .select(
      '_id title salary company.name company.logo company.telegramContact company.telegramPhone location.city locationPoint location.isRemote'
    )
    .limit(500)
    .lean();

  cache.set(PREFIXES.JOBS_MAP, jobs, 60);
  return jobs;
}

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsForMap,
  getMyJobs,
};
