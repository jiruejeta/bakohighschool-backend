const express = require('express');
const router = express.Router();
const {
  createStudent,
  bulkCreateStudents,
  getStudents,
  updateStudent,
  resetStudentPassword,
  deleteStudent,
} = require('../controllers/adminStudentController');
const {
  createStudentValidator,
  bulkCreateStudentValidator,
  updateStudentValidator,
} = require('../validators/adminStudentValidator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/bulk', bulkCreateStudentValidator, validateRequest, bulkCreateStudents);

router.route('/')
  .get(getStudents)
  .post(createStudentValidator, validateRequest, createStudent);

router.route('/:id')
  .put(updateStudentValidator, validateRequest, updateStudent)
  .delete(deleteStudent);

router.post('/:id/reset-password', resetStudentPassword);

module.exports = router;