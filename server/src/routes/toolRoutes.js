const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/code', optionalAuth, toolController.generateCode);
router.post('/summarize', optionalAuth, toolController.summarizeText);
router.post('/translate', optionalAuth, toolController.translateText);
router.post('/sentiment', optionalAuth, toolController.analyzeSentiment);

module.exports = router;
