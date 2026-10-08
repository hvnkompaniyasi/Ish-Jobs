const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);
router.post('/avatar', uploadSingle('avatar'), userController.uploadAvatar);

module.exports = router;
