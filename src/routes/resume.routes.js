const express = require('express');
const resumeController = require('../controllers/resume.controller');
const validate = require('../middleware/validate.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createResumeSchema, updateResumeSchema } = require('../validators/resume.validator');

const router = express.Router();

router.use(protect);

router.get('/my', resumeController.getMyResumes);

router.post(
  '/',
  authorize('seeker', 'admin'),
  validate(createResumeSchema),
  resumeController.createResume
);

router.get('/:id', resumeController.getResume);

router.patch('/:id', validate(updateResumeSchema), resumeController.updateResume);

router.delete('/:id', resumeController.deleteResume);

module.exports = router;
