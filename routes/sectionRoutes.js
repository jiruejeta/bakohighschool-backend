const express = require('express');
const router = express.Router();
const {
  createSection,
  getSections,
  updateSection,
  deleteSection,
} = require('../controllers/sectionController');
const { sectionValidator } = require('../validators/sectionValidator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSections)
  .post(sectionValidator, validateRequest, createSection);

router.route('/:id')
  .put(sectionValidator, validateRequest, updateSection)
  .delete(deleteSection);

module.exports = router;