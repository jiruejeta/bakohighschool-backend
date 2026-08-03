const mongoose = require('mongoose');
const { GRADES } = require('../constants/grades');

const sectionSchema = new mongoose.Schema(
  {
    grade: {
      type: Number,
      enum: { values: GRADES, message: `Grade must be one of ${GRADES.join(', ')}` },
      required: [true, 'Grade is required'],
    },
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
      uppercase: true,
      maxlength: [5, 'Section name must be short, e.g. A, B, C'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

sectionSchema.index({ grade: 1, name: 1 }, { unique: true });

sectionSchema.virtual('label').get(function () {
  return `${this.grade}${this.name}`;
});

sectionSchema.set('toJSON', { virtuals: true });
sectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Section', sectionSchema);