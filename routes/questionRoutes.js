const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  bulkAssignVideo,
} = require('../controllers/questionController');
const { questionValidator } = require('../validators/questionValidator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const { questionUpload, bulkVideoUpload } = require('../middleware/upload');

router.use(protect);

router.post('/bulk', bulkCreateQuestions);
router.post('/bulk-video', bulkVideoUpload, bulkAssignVideo);

router.route('/')
  .get(getQuestions)
  .post(questionUpload, questionValidator, validateRequest, createQuestion);

router.route('/:id')
  .get(getQuestion)
  .put(questionUpload, questionValidator, validateRequest, updateQuestion)
  .delete(deleteQuestion);

module.exports = router;