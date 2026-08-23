const express = require('express');
const { param } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);

router.put(
  '/:id/read',
  [
    param('id').notEmpty().withMessage('Notification ID required'),
    validate
  ],
  notificationController.markAsRead
);

router.delete('/clear', notificationController.clearAll);

module.exports = router;
