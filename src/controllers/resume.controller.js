const resumeService = require('../services/resume.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const createResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.createResume(req.body, req.user);
  res.status(201).json(new ApiResponse(201, resume, 'Rezyume muvaffaqiyatli yaratildi'));
});

const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getMyResumes(req.user);
  res.status(200).json(new ApiResponse(200, resumes, 'Rezyumelar royxati olindi'));
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResumeById(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, resume, 'Rezyume topildi'));
});

const updateResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.updateResume(req.params.id, req.body, req.user);
  res.status(200).json(new ApiResponse(200, resume, 'Rezyume yangilandi'));
});

const deleteResume = asyncHandler(async (req, res) => {
  const result = await resumeService.deleteResume(req.params.id, req.user);
  res.status(200).json(new ApiResponse(200, result, 'Rezyume ochirildi'));
});

module.exports = { createResume, getMyResumes, getResume, updateResume, deleteResume };
