const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  switchRoleSchema,
  deleteAccountSchema,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.me);
router.delete('/me', protect, validate(deleteAccountSchema), authController.deleteAccount);
router.patch('/switch-role', protect, validate(switchRoleSchema), authController.switchRole);

module.exports = router;
