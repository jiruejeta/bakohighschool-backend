const mongoose = require('mongoose');
const { GRADES } = require('../constants/grades');
const { QUESTION_STATUS, ANSWER_CHOICES } = require('../constants/question');

const cloudinaryFileSchema = new mongoose.Schema(
  {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    grade: {
      type: Number,
      enum: { values: GRADES, message: `Grade must be one of ${GRADES.join(', ')}` },
      required: [true, 'Grade is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: [true, 'Chapter is required'],
    },
    nationalExam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NationalExam',
      default: null,
    },
    questionNumber: {
      type: Number,
      required: [true, 'Question number is required'],
      min: [1, 'Question number must be at least 1'],
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    questionImage: {
      type: cloudinaryFileSchema,
      default: () => ({}),
    },
    choices: {
      A: { type: String, required: [true, 'Choice A is required'], trim: true },
      B: { type: String, required: [true, 'Choice B is required'], trim: true },
      C: { type: String, required: [true, 'Choice C is required'], trim: true },
      D: { type: String, required: [true, 'Choice D is required'], trim: true },
    },
    correctAnswer: {
      type: String,
      enum: { values: ANSWER_CHOICES, message: 'Correct answer must be A, B, C, or D' },
      required: [true, 'Correct answer is required'],
    },
    explanation: {
      type: String,
      trim: true,
      default: '',
    },
    explanationImage: {
      type: cloudinaryFileSchema,
      default: () => ({}),
    },
    explanationVideoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    explanationVideoFile: {
      type: cloudinaryFileSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: { values: QUESTION_STATUS, message: `Status must be one of ${QUESTION_STATUS.join(', ')}` },
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

questionSchema.index({ grade: 1, subject: 1, chapter: 1 });
questionSchema.index({ nationalExam: 1 });
questionSchema.index({ questionText: 'text', explanation: 'text' });

module.exports = mongoose.model('Question', questionSchema);