const express = require('express');
const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');
const resumeRoutes = require('./resume.routes');
const applicationRoutes = require('./application.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/resumes', resumeRoutes);
router.use('/applications', applicationRoutes);
router.use('/users', userRoutes);

module.exports = router;
