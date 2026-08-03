const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bako High School Exam Bank API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;