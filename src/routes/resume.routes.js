const express = require('express');
const resumeController = require('../controllers/resume.controller');
const validate = require('../middleware/validate.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createResumeSchema,
  updateResumeSchema,
} = require('../validators/resume.validator');

const router = express.Router();

// ═══════════ PROTECTED (auth kerak) ═══════════
router.use(protect);

// /my — /:id dan OLDIN
router.get('/my', resumeController.getMyResumes);

// Public rezyumelar ro'yxati (employer uchun)
router.get('/', resumeController.listResumes);

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
