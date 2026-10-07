const jobService = require('../services/job.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.body, req.user);
  res.status(201).json(new ApiResponse(201, job, 'Vakansiya muvaffaqiyatli yaratildi'));
});

const getJobs = asyncHandler(async (req, res) => {
  const {
    page, limit, search, category, employmentType, experienceLevel,
    city, isRemote, minSalary, maxSalary, status,
  } = req.query;

  const filters = { search, category, employmentType, experienceLevel, city, isRemote, minSalary, maxSalary, status };
  const result = await jobService.getJobs(filters, { page, limit });
  res.status(200).json(new ApiResponse(200, result, 'Vakansiyalar royxati olindi'));
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

const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.body, req.user);
  res.status(200).json(new ApiResponse(200, job, 'Vakansiya yangilandi'));
});

const deleteJob = asyncHandler(async (req, res) => {
  const result = await jobService.deleteJob(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Vakansiya ochirildi'));
});

const getMyJobs = asyncHandler(async (req, res) => {
  const result = await jobService.getMyJobs(req.user, { page: req.query.page, limit: req.query.limit });
  res.status(200).json(new ApiResponse(200, result, 'Mening vakansiyalarim olindi'));
});

module.exports = { createJob, getJobs, getJob, updateJob, deleteJob, getMyJobs };
