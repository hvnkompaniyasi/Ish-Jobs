const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get(
  '/employer',
  authorize('employer', 'admin'),
  dashboardController.getEmployerDashboard
);

module.exports = router;
