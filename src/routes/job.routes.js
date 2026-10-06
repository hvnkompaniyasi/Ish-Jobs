/**
 * Job endpointlari.
 * Prefix: /api/jobs
 */

const express = require('express');
const jobController = require('../controllers/job.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createJobSchema,
  updateJobSchema,
  listJobsQuerySchema,
} = require('../validators/job.validator');

const router = express.Router();

// Public (hamma ko'rishi mumkin)
router.get('/', validate(listJobsQuerySchema, 'query'), jobController.listJobs);

// Faqat employer — o'z vakansiyalarini ko'rish
router.get('/my', protect, authorize('employer', 'admin'), jobController.getMyJobs);

// Public — bitta vakansiya
router.get('/:id', jobController.getJob);

// Faqat employer — yaratish
router.post(
  '/',
  protect,
  authorize('employer', 'admin'),
  validate(createJobSchema),
  jobController.createJob
);

// Faqat egasi — tahrirlash va o'chirish
router.patch(
  '/:id',
  protect,
  authorize('employer', 'admin'),
  validate(updateJobSchema),
  jobController.updateJob
);

router.delete('/:id', protect, authorize('employer', 'admin'), jobController.deleteJob);

module.exports = router;
