const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, settingsController.getProfile);
router.put('/profile', authenticate, settingsController.updateProfile);
router.put('/password', authenticate, settingsController.changePassword);

module.exports = router;
