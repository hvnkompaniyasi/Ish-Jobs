/**
 * Resume endpointlari.
 * Prefix: /api/resumes
 */

const express = require('express');
const resumeController = require('../controllers/resume.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createResumeSchema,
  updateResumeSchema,
  listResumesQuerySchema,
} = require('../validators/resume.validator');

const router = express.Router();

// Public ro'yxat (hamma ko'radi — faqat isPublic=true)
router.get('/', validate(listResumesQuerySchema, 'query'), resumeController.listResumes);

// Faqat seeker — o'z rezyumelari
router.get(
  '/my',
  protect,
  authorize('seeker', 'admin'),
  resumeController.getMyResumes
);

// Public — bitta rezyume
router.get('/:id', resumeController.getResume);

// Faqat seeker — yaratish
router.post(
  '/',
  protect,
  authorize('seeker', 'admin'),
  validate(createResumeSchema),
  resumeController.createResume
);

// Faqat egasi — tahrirlash va o'chirish
router.patch(
  '/:id',
  protect,
  authorize('seeker', 'admin'),
  validate(updateResumeSchema),
  resumeController.updateResume
);

router.delete(
  '/:id',
  protect,
  authorize('seeker', 'admin'),
  resumeController.deleteResume
);

module.exports = router;
