const express = require('express');
const { param, query } = require('express-validator');
const executionController = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  executionController.listExecutions
);

router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid execution ID required'),
    validate
  ],
  executionController.getExecution
);

router.get(
  '/:id/timeline',
  [
    param('id').isMongoId().withMessage('Valid execution ID required'),
    validate
  ],
  executionController.getTimeline
);

router.post(
  '/:id/pause',
  [
    param('id').isMongoId().withMessage('Valid execution ID required'),
    validate
  ],
  executionController.pauseExecution
);

router.post(
  '/:id/resume',
  [
    param('id').isMongoId().withMessage('Valid execution ID required'),
    validate
  ],
  executionController.resumeExecution
);

router.post(
  '/:id/cancel',
  [
    param('id').isMongoId().withMessage('Valid execution ID required'),
    validate
  ],
  executionController.cancelExecution
);

module.exports = router;
