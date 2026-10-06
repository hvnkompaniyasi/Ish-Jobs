/**
 * Job controller — HTTP qatlami.
 */

const jobService = require('../services/job.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/jobs
 */
const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, job, 'Vakansiya yaratildi'));
});

/**
 * GET /api/jobs
 */
const listJobs = asyncHandler(async (req, res) => {
  const result = await jobService.listJobs(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Vakansiyalar royxati'));
});

/**
 * GET /api/jobs/my
 */
const getMyJobs = asyncHandler(async (req, res) => {
  const result = await jobService.getMyJobs(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Mening vakansiyalarim'));
});

/**
 * GET /api/jobs/:id
 */
const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  res.status(200).json(new ApiResponse(200, job, 'Vakansiya topildi'));
});

/**
 * PATCH /api/jobs/:id
 */
const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, job, 'Vakansiya yangilandi'));
});

/**
 * DELETE /api/jobs/:id
 */
const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Vakansiya ochirildi'));
});

module.exports = {
  createJob,
  listJobs,
  getJob,
  updateJob,
  deleteJob,
  getMyJobs,
};
