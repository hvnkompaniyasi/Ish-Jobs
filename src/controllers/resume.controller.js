/**
 * Resume controller — HTTP qatlami.
 */

const resumeService = require('../services/resume.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/resumes
 */
const createResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.createResume(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, resume, 'Rezyume yaratildi'));
});

/**
 * GET /api/resumes
 */
const listResumes = asyncHandler(async (req, res) => {
  const result = await resumeService.listResumes(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Rezyumelar royxati'));
});

/**
 * GET /api/resumes/my
 */
const getMyResumes = asyncHandler(async (req, res) => {
  const result = await resumeService.getMyResumes(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, 'Mening rezyumelarim'));
});

/**
 * GET /api/resumes/:id
 */
const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResumeById(req.params.id);
  res.status(200).json(new ApiResponse(200, resume, 'Rezyume topildi'));
});

/**
 * PATCH /api/resumes/:id
 */
const updateResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.updateResume(
    req.params.id,
    req.user._id,
    req.body
  );
  res.status(200).json(new ApiResponse(200, resume, 'Rezyume yangilandi'));
});

/**
 * DELETE /api/resumes/:id
 */
const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'Rezyume ochirildi'));
});

module.exports = {
  createResume,
  listResumes,
  getResume,
  updateResume,
  deleteResume,
  getMyResumes,
};
