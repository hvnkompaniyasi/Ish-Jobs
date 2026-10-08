/**
 * Job controller — HTTP qatlami.
 * Form-data parser + R2 logo yuklash.
 */

const jobService = require('../services/job.service');
const uploadService = require('../services/upload.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/jobs
 * Multipart form-data + optional companyLogo file
 */
const createJob = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'Malumotlar yuborilmadi');
  }
  const body = req.body;

  // Agar logotip yuborilgan bo'lsa — R2'ga yuklash
  if (req.file) {
    const uploaded = await uploadService.uploadCompanyLogo(
      req.file,
      req.user._id.toString()
    );
    body.company = {
      ...(body.company || {}),
      logo: uploaded.url,
      logoPublicId: uploaded.publicId,
    };
  }

  const job = await jobService.createJob(body, req.user);
  res
    .status(201)
    .json(new ApiResponse(201, job, 'Vakansiya muvaffaqiyatli yaratildi'));
});

/**
 * GET /api/jobs
 */
const getJobs = asyncHandler(async (req, res) => {
  const {
    page, limit, search, category, employmentType, experienceLevel,
    city, isRemote, minSalary, maxSalary, status,
  } = req.query;

  const filters = { search, category, employmentType, experienceLevel, city, isRemote, minSalary, maxSalary, status };
  const result = await jobService.getJobs(filters, { page, limit });
  res
    .status(200)
    .json(new ApiResponse(200, result, 'Vakansiyalar royxati olindi'));
});

/**
 * GET /api/jobs/:id
 * Unique view: faqat X-View-Unique: 1 bo'lganda viewsCount oshadi.
 */
const getJob = asyncHandler(async (req, res) => {
  const isUniqueView = req.headers['x-view-unique'] === '1';
  const job = await jobService.getJobById(req.params.id, isUniqueView);
  res.status(200).json(new ApiResponse(200, job, 'Vakansiya topildi'));
});

/**
 * PATCH /api/jobs/:id
 * IDOR himoyasi service qatlamida (defense in depth).
 * Multipart + optional yangi logo.
 */
const updateJob = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    throw new ApiError(400, 'Malumotlar yuborilmadi');
  }
  const body = req.body;

  // Yangi logotip yuklangan bo'lsa
  if (req.file) {
    const uploaded = await uploadService.uploadCompanyLogo(
      req.file,
      req.user._id.toString()
    );
    body.company = {
      ...(body.company || {}),
      logo: uploaded.url,
      logoPublicId: uploaded.publicId,
    };
  }

  const job = await jobService.updateJob(req.params.id, body, req.user);
  res.status(200).json(new ApiResponse(200, job, 'Vakansiya yangilandi'));
});

/**
 * PATCH /api/jobs/:id/status
 * Status boshqaruvi — active ⇄ closed ⇄ draft ⇄ archived
 */
const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['draft', 'active', 'closed', 'archived'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Status faqat: ${allowed.join(', ')}`);
  }

  const job = await jobService.updateJob(req.params.id, { status }, req.user);
  res.status(200).json(new ApiResponse(200, job, `Status: ${status}`));
});

/**
 * DELETE /api/jobs/:id
 */
const deleteJob = asyncHandler(async (req, res) => {
  const result = await jobService.deleteJob(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Vakansiya ochirildi'));
});

/**
 * GET /api/jobs/my
 */
const getMyJobs = asyncHandler(async (req, res) => {
  const result = await jobService.getMyJobs(req.user, {
    page: req.query.page,
    limit: req.query.limit,
  });
  res.status(200).json(new ApiResponse(200, result, 'Mening vakansiyalarim olindi'));
});

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getMyJobs,
};
