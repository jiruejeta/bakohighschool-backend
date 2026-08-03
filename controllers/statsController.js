const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const NationalExam = require('../models/NationalExam');
const { GRADES } = require('../constants/grades');

// @desc    Get dashboard summary stats
// @route   GET /api/stats/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const [totalQuestions, totalSubjects, totalChapters, totalNationalExams] = await Promise.all([
      Question.countDocuments(),
      Subject.countDocuments(),
      Chapter.countDocuments(),
      NationalExam.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalQuestions,
        totalSubjects,
        totalChapters,
        totalGrades: GRADES.length,
        totalNationalExams,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get question counts grouped by grade
// @route   GET /api/stats/by-grade
// @access  Private
const getByGrade = async (req, res, next) => {
  try {
    const results = await Question.aggregate([
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const data = GRADES.map((g) => {
      const match = results.find((r) => r._id === g);
      return { grade: g, count: match ? match.count : 0 };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get question counts grouped by subject
// @route   GET /api/stats/by-subject
// @access  Private
const getBySubject = async (req, res, next) => {
  try {
    const results = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          subjectId: '$_id',
          name: { $ifNull: ['$subject.name', 'Unknown'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get question counts grouped by national exam year
// @route   GET /api/stats/by-year
// @access  Private
const getByYear = async (req, res, next) => {
  try {
    const results = await Question.aggregate([
      { $match: { nationalExam: { $ne: null } } },
      { $group: { _id: '$nationalExam', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'nationalexams',
          localField: '_id',
          foreignField: '_id',
          as: 'exam',
        },
      },
      { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          nationalExamId: '$_id',
          year: '$exam.year',
          count: 1,
        },
      },
      { $sort: { year: -1 } },
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recently added questions
// @route   GET /api/stats/recent
// @access  Private
const getRecent = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    const questions = await Question.find()
      .populate('subject', 'name')
      .populate('chapter', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getByGrade, getBySubject, getByYear, getRecent };