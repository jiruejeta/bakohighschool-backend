const express = require('express');
const router = express.Router();
const {
  getSummary,
  getByGrade,
  getBySubject,
  getByYear,
  getRecent,
} = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getSummary);
router.get('/by-grade', getByGrade);
router.get('/by-subject', getBySubject);
router.get('/by-year', getByYear);
router.get('/recent', getRecent);

module.exports = router;