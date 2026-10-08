const express = require('express');
const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');
const resumeRoutes = require('./resume.routes');
const applicationRoutes = require('./application.routes');
const userRoutes = require('./user.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/resumes', resumeRoutes);
router.use('/applications', applicationRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
