const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

attemptSchema.index({ student: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);