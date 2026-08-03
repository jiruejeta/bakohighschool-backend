const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const NationalExam = require('../models/NationalExam');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { GRADES } = require('../constants/grades');

const computeChapterStatus = async (studentId, subjectId, chapterId, grade, yearId) => {
  const questions = await Question.find({
    subject: subjectId,
    chapter: chapterId,
    grade,
    nationalExam: yearId,
    status: 'published',
  }).select('_id');

  const totalQuestions = questions.length;
  const questionIds = questions.map((q) => q._id);

  let attemptedCount = 0;
  let correctCount = 0;

  if (questionIds.length > 0) {
    const attempts = await Attempt.find({
      student: studentId,
      question: { $in: questionIds },
    });
    attemptedCount = attempts.length;
    correctCount = attempts.filter((a) => a.isCorrect).length;
  }

  let status = 'not_started';
  if (attemptedCount > 0) {
    status =
      attemptedCount === totalQuestions && correctCount === totalQuestions && totalQuestions > 0
        ? 'completed'
        : 'needs_review';
  }

  return { totalQuestions, attemptedCount, correctCount, status };
};

// @desc    Get all active subjects
// @route   GET /api/student/subjects
// @access  Private (student)
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active national exam years
// @route   GET /api/student/years
// @access  Private (student)
const getYears = async (req, res, next) => {
  try {
    const years = await NationalExam.find({ isActive: true }).sort({ year: -1 });
    res.status(200).json({ success: true, data: years });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chapters (with status) for one Subject + Year + Grade
// @route   GET /api/student/chapters?subject=&year=&grade=
// @access  Private (student)
const getChaptersForGrade = async (req, res, next) => {
  try {
    const { subject, year, grade } = req.query;

    if (!subject || !year || !grade) {
      return res.status(400).json({
        success: false,
        message: 'subject, year, and grade are required',
      });
    }

    const chapters = await Chapter.find({
      subject,
      grade: Number(grade),
      isActive: true,
    }).sort({ order: 1, title: 1 });

    const data = await Promise.all(
      chapters.map(async (chapter) => {
        const stats = await computeChapterStatus(
          req.student.id,
          subject,
          chapter._id,
          Number(grade),
          year
        );
        return {
          chapterId: chapter._id,
          title: chapter.title,
          grade: Number(grade),
          ...stats,
        };
      })
    );

    res.status(200).json({ success: true, data: data.filter((c) => c.totalQuestions > 0) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get combined chapters across all grades (9-12) for one Subject + Year ("Full Subject")
// @route   GET /api/student/full-chapters?subject=&year=
// @access  Private (student)
const getFullChapters = async (req, res, next) => {
  try {
    const { subject, year } = req.query;

    if (!subject || !year) {
      return res.status(400).json({
        success: false,
        message: 'subject and year are required',
      });
    }

    let combined = [];

    for (const grade of GRADES) {
      const chapters = await Chapter.find({ subject, grade, isActive: true }).sort({
        order: 1,
        title: 1,
      });

      const gradeData = await Promise.all(
        chapters.map(async (chapter) => {
          const stats = await computeChapterStatus(
            req.student.id,
            subject,
            chapter._id,
            grade,
            year
          );
          return {
            chapterId: chapter._id,
            title: chapter.title,
            grade,
            ...stats,
          };
        })
      );

      combined = combined.concat(gradeData.filter((c) => c.totalQuestions > 0));
    }

    const summary = combined.reduce(
      (acc, c) => {
        acc.totalQuestions += c.totalQuestions;
        acc.attemptedCount += c.attemptedCount;
        acc.correctCount += c.correctCount;
        return acc;
      },
      { totalQuestions: 0, attemptedCount: 0, correctCount: 0 }
    );

    res.status(200).json({ success: true, summary, data: combined });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubjects, getYears, getChaptersForGrade, getFullChapters };