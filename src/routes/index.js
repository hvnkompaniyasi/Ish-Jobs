/**
 * Barcha route'larni birlashtiruvchi.
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const jobRoutes = require('./job.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);

module.exports = router;
