const NationalExam = require('../models/NationalExam');

// @desc    Create a national exam year
// @route   POST /api/national-exams
// @access  Private
const createNationalExam = async (req, res, next) => {
  try {
    const { year, title } = req.body;

    const existing = await NationalExam.findOne({ year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A national exam entry for ${year} already exists`,
      });
    }

    const nationalExam = await NationalExam.create({ year, title });

    res.status(201).json({ success: true, data: nationalExam });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all national exam years
// @route   GET /api/national-exams
// @access  Private
const getNationalExams = async (req, res, next) => {
  try {
    const nationalExams = await NationalExam.find().sort({ year: -1 });
    res.status(200).json({
      success: true,
      count: nationalExams.length,
      data: nationalExams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single national exam year
// @route   GET /api/national-exams/:id
// @access  Private
const getNationalExam = async (req, res, next) => {
  try {
    const nationalExam = await NationalExam.findById(req.params.id);
    if (!nationalExam) {
      return res.status(404).json({ success: false, message: 'National exam entry not found' });
    }
    res.status(200).json({ success: true, data: nationalExam });
  } catch (error) {
    next(error);
  }
};

// @desc    Update national exam year
// @route   PUT /api/national-exams/:id
// @access  Private
const updateNationalExam = async (req, res, next) => {
  try {
    const { year, title, isActive } = req.body;

    const nationalExam = await NationalExam.findById(req.params.id);
    if (!nationalExam) {
      return res.status(404).json({ success: false, message: 'National exam entry not found' });
    }

    if (year !== undefined && Number(year) !== nationalExam.year) {
      const existing = await NationalExam.findOne({ year });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A national exam entry for ${year} already exists`,
        });
      }
    }

    if (year !== undefined) nationalExam.year = year;
    if (title !== undefined) nationalExam.title = title;
    if (isActive !== undefined) nationalExam.isActive = isActive;

    await nationalExam.save();

    res.status(200).json({ success: true, data: nationalExam });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete national exam year
// @route   DELETE /api/national-exams/:id
// @access  Private
const deleteNationalExam = async (req, res, next) => {
  try {
    const nationalExam = await NationalExam.findById(req.params.id);
    if (!nationalExam) {
      return res.status(404).json({ success: false, message: 'National exam entry not found' });
    }

    await nationalExam.deleteOne();

    res.status(200).json({ success: true, message: 'National exam entry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNationalExam,
  getNationalExams,
  getNationalExam,
  updateNationalExam,
  deleteNationalExam,
};