const express = require('express');
const router = express.Router();
const {
  createNationalExam,
  getNationalExams,
  getNationalExam,
  updateNationalExam,
  deleteNationalExam,
} = require('../controllers/nationalExamController');
const { nationalExamValidator } = require('../validators/nationalExamValidator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getNationalExams)
  .post(nationalExamValidator, validateRequest, createNationalExam);

router.route('/:id')
  .get(getNationalExam)
  .put(nationalExamValidator, validateRequest, updateNationalExam)
  .delete(deleteNationalExam);

module.exports = router;