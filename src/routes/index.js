/**
 * Barcha route'larni birlashtiruvchi.
 */

const express = require('express');
const authRoutes = require('./auth.routes');

const router = express.Router();

router.use('/auth', authRoutes);

// Kelajakda:
// router.use('/jobs', jobRoutes);
// router.use('/resumes', resumeRoutes);
// router.use('/applications', applicationRoutes);

module.exports = router;
