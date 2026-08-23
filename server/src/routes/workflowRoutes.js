const express = require('express');
const { body, param, query } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// AI Prompt Generation is accessible for instant synthesis
router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Automation prompt text is required'),
    validate
  ],
  workflowController.generateWorkflow
);

// Protected routes requiring authentication
router.use(protect);

router.get('/dashboard', workflowController.getDashboard);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  workflowController.listWorkflows
);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
    body('nodes').optional().isArray().withMessage('Nodes must be an array'),
    body('edges').optional().isArray().withMessage('Edges must be an array'),
    validate
  ],
  workflowController.createWorkflow
);

router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid workflow ID required'),
    validate
  ],
  workflowController.getWorkflow
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid workflow ID required'),
    body('name').optional().trim().notEmpty(),
    validate
  ],
  workflowController.updateWorkflow
);

router.post(
  '/:id/duplicate',
  [
    param('id').isMongoId().withMessage('Valid workflow ID required'),
    validate
  ],
  workflowController.duplicateWorkflow
);

router.post(
  '/:id/execute',
  [
    param('id').isMongoId().withMessage('Valid workflow ID required'),
    validate
  ],
  workflowController.executeWorkflow
);

router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Valid workflow ID required'),
    validate
  ],
  workflowController.deleteWorkflow
);

module.exports = router;
