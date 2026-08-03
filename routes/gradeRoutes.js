const express = require('express');
const router = express.Router();
const { GRADES } = require('../constants/grades');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, (req, res) => {
  res.status(200).json({ success: true, data: GRADES });
});

module.exports = router;