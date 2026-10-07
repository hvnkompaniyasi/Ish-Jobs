const express = require('express');
const applicationController = require('../controllers/application.controller');
const validate = require('../middleware/validate.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createApplicationSchema,
  updateStatusSchema,
} = require('../validators/application.validator');

const router = express.Router();

router.use(protect);

// Seeker routes
router.post(
  '/',
  authorize('seeker', 'admin'),
  validate(createApplicationSchema),
  applicationController.createApplication
);

router.get('/my', applicationController.getMyApplications);

router.patch('/:id/withdraw', applicationController.withdraw);

// Employer routes
router.get('/job/:jobId', applicationController.getApplicationsForJob);

router.patch(
  '/:id/status',
  authorize('employer', 'admin'),
  validate(updateStatusSchema),
  applicationController.updateStatus
);

module.exports = router;
