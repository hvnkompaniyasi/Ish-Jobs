/**
 * Application controller — HTTP qatlami.
 */

const applicationService = require('../services/application.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/applications (seeker)
 */
const createApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.createApplication(
    req.user._id,
    req.body
  );
  res.status(201).json(new ApiResponse(201, application, 'Ariza yuborildi'));
});

/**
 * GET /api/applications/my (seeker)
 */
const getMyApplications = asyncHandler(async (req, res) => {
  const result = await applicationService.getMyApplications(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Mening arizalarim'));
});

/**
 * GET /api/applications/job/:jobId (employer)
 */
const getJobApplications = asyncHandler(async (req, res) => {
  const result = await applicationService.getJobApplications(
    req.params.jobId,
    req.user._id,
    req.query
  );
  res.status(200).json(new ApiResponse(200, result, 'Vakansiyaga kelgan arizalar'));
});

/**
 * GET /api/applications/:id
 */
const getApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationById(
    req.params.id,
    req.user._id
  );
  res.status(200).json(new ApiResponse(200, application, 'Ariza topildi'));
});

/**
 * PATCH /api/applications/:id/status (employer)
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.user._id,
    req.body
  );
  res.status(200).json(new ApiResponse(200, application, 'Status yangilandi'));
});

/**
 * DELETE /api/applications/:id (seeker)
 */
const withdrawApplication = asyncHandler(async (req, res) => {
  await applicationService.withdrawApplication(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Ariza bekor qilindi'));
});

module.exports = {
  createApplication,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
};
