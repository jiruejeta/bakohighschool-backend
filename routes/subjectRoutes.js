const express = require('express');
const router = express.Router();
const {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { subjectValidator } = require('../validators/subjectValidator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(subjectValidator, validateRequest, createSubject);

router.route('/:id')
  .get(getSubject)
  .put(subjectValidator, validateRequest, updateSubject)
  .delete(deleteSubject);

module.exports = router;