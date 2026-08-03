const mongoose = require('mongoose');

const nationalExamSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, 'Exam year is required'],
      unique: true,
      min: [2000, 'Year must be a valid year'],
      max: [2100, 'Year must be a valid year'],
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NationalExam', nationalExamSchema);