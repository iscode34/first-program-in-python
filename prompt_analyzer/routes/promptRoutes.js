const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');
const { authenticate } = require('../middleware/auth');

router.post('/analyze', authenticate, promptController.analyzePrompt);
router.post('/enhance', authenticate, promptController.enhancePrompt);
router.post('/', authenticate, promptController.savePrompt);
router.get('/', authenticate, promptController.getPrompts);
router.get('/:id', authenticate, promptController.getPromptById);
router.delete('/:id', authenticate, promptController.deletePrompt);
router.patch('/:id/favorite', authenticate, promptController.toggleFavorite);
router.get('/:id/history', authenticate, promptController.getPromptHistory);
router.post('/:id/restore/:historyId', authenticate, promptController.restoreVersion);

module.exports = router;
