const express = require('express');
const { body, validationResult } = require('express-validator');
const { logUserAction } = require('../utils/actionLogger');

const router = express.Router();

/**
 * Log user action from frontend
 * POST /api/actions/log
 */
router.post('/log', [
  body('action').isString().notEmpty().withMessage('Action is required'),
  body('userId').optional().isString(),
  body('timestamp').isISO8601().withMessage('Valid timestamp is required'),
  body('metadata').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action, userId, timestamp, metadata = {} } = req.body;

    // Log the action using existing actionLogger
    logUserAction(action, {
      userId,
      timestamp,
      ...metadata,
    }, req);

    res.json({
      success: true,
      message: 'Action logged successfully'
    });
  } catch (error) {
    console.error('Log action error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;