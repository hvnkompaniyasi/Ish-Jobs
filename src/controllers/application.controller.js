const applicationService = require('../services/application.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.createApplication(req.body, req.user);
  res.status(201).json(new ApiResponse(201, application, 'Ariza muvaffaqiyatli yuborildi'));
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.getMyApplications(req.user);
  res.status(200).json(new ApiResponse(200, applications, 'Arizalar royxati olindi'));
});

const getApplicationsForJob = asyncHandler(async (req, res) => {
  const result = await applicationService.getApplicationsForJob(req.params.jobId, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Vakansiyaga kelgan arizalar'));
});

const updateStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.body.status,
    req.user
  );
  res.status(200).json(new ApiResponse(200, application, 'Ariza statusi yangilandi'));
});

const withdraw = asyncHandler(async (req, res) => {
  const application = await applicationService.withdrawApplication(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, application, 'Ariza olib tashlandi'));
});

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationsForJob,
  updateStatus,
  withdraw,
};
