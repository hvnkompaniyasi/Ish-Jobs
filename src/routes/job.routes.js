/**
 * Job endpointlari.
 * Prefix: /api/jobs
 */

const express = require('express');
const jobController = require('../controllers/job.controller');
const validate = require('../middleware/validate.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const parseFormData = require('../middleware/parseFormData.middleware');
const {
  createJobSchema,
  updateJobSchema,
} = require('../validators/job.validator');

const router = express.Router();

// ═══════════ PUBLIC ═══════════
router.get('/', jobController.getJobs);

// ═══════════ PROTECTED ═══════════
// /my — /:id dan OLDIN turishi shart
router.get(
  '/my',
  protect,
  authorize('employer', 'admin'),
  jobController.getMyJobs
);

router.post(
  '/',
  protect,
  authorize('employer', 'admin'),
  uploadSingle('companyLogo'),
  parseFormData,
  validate(createJobSchema),
  jobController.createJob
);

// ═══════════ PUBLIC (bitta) ═══════════
router.get('/:id', jobController.getJob);

// ═══════════ PROTECTED (egasi) ═══════════
router.patch(
  '/:id',
  protect,
  authorize('employer', 'admin'),
  uploadSingle('companyLogo'),
  parseFormData,
  validate(updateJobSchema),
  jobController.updateJob
);

// Statusni alohida endpoint — logotip yubormasdan
router.patch(
  '/:id/status',
  protect,
  authorize('employer', 'admin'),
  jobController.updateJobStatus
);

router.delete(
  '/:id',
  protect,
  authorize('employer', 'admin'),
  jobController.deleteJob
);

module.exports = router;
