const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, templateController.getTemplates);
router.post('/:templateId/clone', authenticate, templateController.cloneTemplate);

module.exports = router;
