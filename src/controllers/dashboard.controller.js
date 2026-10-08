const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/dashboard/employer?period=7d|30d|all
 */
const getEmployerDashboard = asyncHandler(async (req, res) => {
  const result = await dashboardService.getEmployerDashboard(req.user, {
    period: req.query.period,
  });
  res.status(200).json(new ApiResponse(200, result, 'Dashboard malumotlari'));
});

module.exports = { getEmployerDashboard };
