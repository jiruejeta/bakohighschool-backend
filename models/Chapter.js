const mongoose = require('mongoose');
const { GRADES } = require('../constants/grades');

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Chapter title is required'],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    grade: {
      type: Number,
      enum: {
        values: GRADES,
        message: 'Grade must be one of 9, 10, 11, 12',
      },
      required: [true, 'Grade is required'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate chapter titles within the same subject+grade
chapterSchema.index({ title: 1, subject: 1, grade: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', chapterSchema);