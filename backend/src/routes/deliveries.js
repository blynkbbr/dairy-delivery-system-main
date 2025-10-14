const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.json({ success: false, message: 'Deliveries endpoint not yet implemented' });
});

module.exports = router;