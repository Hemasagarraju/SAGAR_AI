const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate', optionalAuth, imageController.generateImage);
router.post('/enhance', optionalAuth, imageController.enhancePrompt);
router.post('/enhance-prompt', optionalAuth, imageController.enhancePrompt);
router.get('/gallery', optionalAuth, imageController.getGallery);
router.delete('/:id', optionalAuth, imageController.deleteImage);

module.exports = router;
