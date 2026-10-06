/**
 * Application endpointlari.
 * Prefix: /api/applications
 */

const express = require('express');
const applicationController = require('../controllers/application.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createApplicationSchema,
  updateStatusSchema,
  listApplicationsQuerySchema,
} = require('../validators/application.validator');

const router = express.Router();

// Barcha route'lar himoyalangan
router.use(protect);

// Seeker — o'z arizalari
router.get(
  '/my',
  authorize('seeker', 'admin'),
  validate(listApplicationsQuerySchema, 'query'),
  applicationController.getMyApplications
);

// Employer — vakansiyaga kelgan arizalar
router.get(
  '/job/:jobId',
  authorize('employer', 'admin'),
  validate(listApplicationsQuerySchema, 'query'),
  applicationController.getJobApplications
);

// Seeker — ariza yuborish
router.post(
  '/',
  authorize('seeker', 'admin'),
  validate(createApplicationSchema),
  applicationController.createApplication
);

// Bitta ariza (applicant yoki employer)
router.get('/:id', applicationController.getApplication);

// Employer — status o'zgartirish
router.patch(
  '/:id/status',
  authorize('employer', 'admin'),
  validate(updateStatusSchema),
  applicationController.updateApplicationStatus
);

// Seeker — arizani bekor qilish
router.delete(
  '/:id',
  authorize('seeker', 'admin'),
  applicationController.withdrawApplication
);

module.exports = router;
