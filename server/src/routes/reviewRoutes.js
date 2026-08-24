const express = require('express');
const reviewController = require('../controllers/reviewController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public & Optional Auth endpoints
router.post('/', optionalAuth, reviewController.submitReview);
router.get('/', reviewController.getReviews);
router.post('/ping', reviewController.recordPing);

module.exports = router;
