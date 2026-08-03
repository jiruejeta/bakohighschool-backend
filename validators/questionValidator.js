const { body } = require('express-validator');
const { GRADES } = require('../constants/grades');
const { QUESTION_STATUS, ANSWER_CHOICES } = require('../constants/question');

const questionValidator = [
  body('grade')
    .notEmpty().withMessage('Grade is required')
    .custom((value) => GRADES.includes(Number(value)))
    .withMessage(`Grade must be one of ${GRADES.join(', ')}`),
  body('subject').notEmpty().withMessage('Subject is required').isMongoId().withMessage('Invalid subject id'),
  body('chapter').notEmpty().withMessage('Chapter is required').isMongoId().withMessage('Invalid chapter id'),
  body('nationalExam')
    .optional({ checkFalsy: true })
    .isMongoId().withMessage('Invalid national exam id'),
  body('questionNumber')
    .notEmpty().withMessage('Question number is required')
    .isInt({ min: 1 }).withMessage('Question number must be a positive number'),
  body('questionText').trim().notEmpty().withMessage('Question text is required'),
  body('choices.A').trim().notEmpty().withMessage('Choice A is required'),
  body('choices.B').trim().notEmpty().withMessage('Choice B is required'),
  body('choices.C').trim().notEmpty().withMessage('Choice C is required'),
  body('choices.D').trim().notEmpty().withMessage('Choice D is required'),
  body('correctAnswer')
    .notEmpty().withMessage('Correct answer is required')
    .isIn(ANSWER_CHOICES).withMessage('Correct answer must be A, B, C, or D'),
  body('explanation').optional().trim(),
  body('explanationVideoUrl').optional({ checkFalsy: true }).isURL().withMessage('Explanation video URL must be valid'),
  body('status').optional().isIn(QUESTION_STATUS).withMessage(`Status must be one of ${QUESTION_STATUS.join(', ')}`),
];

module.exports = { questionValidator };