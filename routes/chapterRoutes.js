const express = require('express');
const router = express.Router();
const {
  createChapter,
  getChapters,
  getChapter,
  updateChapter,
  deleteChapter,
} = require('../controllers/chapterController');
const { chapterValidator } = require('../validators/chapterValidator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getChapters)
  .post(chapterValidator, validateRequest, createChapter);

router.route('/:id')
  .get(getChapter)
  .put(chapterValidator, validateRequest, updateChapter)
  .delete(deleteChapter);

module.exports = router;