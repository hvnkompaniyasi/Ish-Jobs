/**
 * Auth endpointlari.
 * Prefix: /api/auth
 */

const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;
