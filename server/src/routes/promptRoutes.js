const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/optimize', optionalAuth, promptController.optimizePrompt);
router.post('/system-persona', optionalAuth, promptController.generateSystemPrompt);
router.get('/templates', promptController.getTemplates);
router.get('/saved', optionalAuth, promptController.getSavedPrompts);
router.post('/saved', optionalAuth, promptController.savePrompt);
router.delete('/saved/:id', optionalAuth, promptController.deleteSavedPrompt);

module.exports = router;
