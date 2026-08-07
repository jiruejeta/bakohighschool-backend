const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getYears,
  getChaptersForGrade,
  getFullChapters,
} = require('../controllers/studentBrowseController');
const {
  getChapterQuestions,
  getFullExamQuestions,
  submitAnswer,
  submitBatchAnswers,
  getSubjectForDownload,
} = require('../controllers/studentQuizController');
const { protectStudent } = require('../middleware/studentAuthMiddleware');

router.use(protectStudent);

router.get('/subjects', getSubjects);
router.get('/years', getYears);
router.get('/chapters', getChaptersForGrade);
router.get('/full-chapters', getFullChapters);

router.get('/quiz/chapter', getChapterQuestions);
router.get('/quiz/full', getFullExamQuestions);
router.get('/quiz/download-subject', getSubjectForDownload);
router.post('/quiz/answer', submitAnswer);
router.post('/quiz/submit-batch', submitBatchAnswers);

module.exports = router;