const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const Chapter = require('../models/Chapter');
const { GRADES } = require('../constants/grades');

const sanitizeQuestion = (q, attemptMap) => {
  const attempt = attemptMap.get(String(q._id));
  return {
    _id: q._id,
    questionNumber: q.questionNumber,
    questionText: q.questionText,
    questionImage: q.questionImage,
    choices: q.choices,
    grade: q.grade,
    chapter: q.chapter,
    // correctAnswer and explanation withheld until answered
    yourAnswer: attempt ? attempt.selectedAnswer : null,
    isCorrect: attempt ? attempt.isCorrect : null,
    answered: !!attempt,
  };
};

// @desc    Get questions for one chapter (single-chapter instant feedback mode)
// @route   GET /api/student/quiz/chapter?subject=&year=&grade=&chapter=
// @access  Private (student)
const getChapterQuestions = async (req, res, next) => {
  try {
    const { subject, year, grade, chapter } = req.query;

    if (!subject || !grade || !chapter) {
      return res.status(400).json({ success: false, message: 'subject, grade, and chapter are required' });
    }

    const chapterDoc = await Chapter.findById(chapter).select('title');

    const questions = await Question.find({
      subject,
      chapter,
      grade: Number(grade),
      nationalExam: year || null,
      status: 'published',
    }).sort({ questionNumber: 1 });

    const attempts = await Attempt.find({
      student: req.student.id,
      question: { $in: questions.map((q) => q._id) },
    });
    const attemptMap = new Map(attempts.map((a) => [String(a.question), a]));

    const data = questions.map((q) => sanitizeQuestion(q, attemptMap));

    res.status(200).json({
      success: true,
      chapterTitle: chapterDoc ? chapterDoc.title : '',
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all questions across grades 9-12 for one subject+year (full exam mode)
// @route   GET /api/student/quiz/full?subject=&year=
// @access  Private (student)
const getFullExamQuestions = async (req, res, next) => {
  try {
    const { subject, year } = req.query;

    if (!subject || !year) {
      return res.status(400).json({ success: false, message: 'subject and year are required' });
    }

    const questions = await Question.find({
      subject,
      grade: { $in: GRADES },
      nationalExam: year,
      status: 'published',
    })
      .populate('chapter', 'title')
      .sort({ grade: 1, questionNumber: 1 });

    const data = questions.map((q) => ({
      _id: q._id,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      questionImage: q.questionImage,
      choices: q.choices,
      grade: q.grade,
      chapter: q.chapter,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit one answer (instant feedback mode) — creates or updates the attempt
// @route   POST /api/student/quiz/answer
// @access  Private (student)
const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, selectedAnswer } = req.body;

    if (!questionId || !['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
      return res.status(400).json({ success: false, message: 'questionId and a valid selectedAnswer are required' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;

    const attempt = await Attempt.findOneAndUpdate(
      { student: req.student.id, question: questionId },
      { selectedAnswer, isCorrect },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: {
        questionId,
        selectedAnswer,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        explanationImage: question.explanationImage,
        explanationVideoUrl: question.explanationVideoUrl,
        explanationVideoFile: question.explanationVideoFile,
        attemptId: attempt._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a full batch of answers at once (used at end of timed Full Exam)
// @route   POST /api/student/quiz/submit-batch
// @access  Private (student)
const submitBatchAnswers = async (req, res, next) => {
  try {
    const { answers } = req.body; // [{ questionId, selectedAnswer }]

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'answers array is required' });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map((q) => [String(q._id), q]));

    let correctCount = 0;
    const results = [];

    for (const ans of answers) {
      const question = questionMap.get(ans.questionId);
      if (!question || !['A', 'B', 'C', 'D'].includes(ans.selectedAnswer)) continue;

      const isCorrect = question.correctAnswer === ans.selectedAnswer;
      if (isCorrect) correctCount++;

      await Attempt.findOneAndUpdate(
        { student: req.student.id, question: question._id },
        { selectedAnswer: ans.selectedAnswer, isCorrect },
        { upsert: true, setDefaultsOnInsert: true }
      );

      results.push({
        questionId: question._id,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        yourAnswer: ans.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        explanationImage: question.explanationImage,
        explanationVideoUrl: question.explanationVideoUrl,
        explanationVideoFile: question.explanationVideoFile,
        choices: question.choices,
        grade: question.grade,
      });
    }

    res.status(200).json({
      success: true,
      totalAnswered: results.length,
      correctCount,
      incorrectCount: results.length - correctCount,
      scorePercent: results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0,
      results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ALL published questions for a subject (all grades/chapters combined) — used for offline download
// @route   GET /api/student/quiz/download-subject?subject=
// @access  Private (student)
const getSubjectForDownload = async (req, res, next) => {
  try {
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ success: false, message: 'subject is required' });
    }

    const questions = await Question.find({
      subject,
      status: 'published',
    })
      .populate('chapter', 'title')
      .sort({ grade: 1, questionNumber: 1 });

    const data = questions.map((q) => ({
      _id: q._id,
      grade: q.grade,
      chapter: q.chapter,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      questionImage: q.questionImage,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      explanationImage: q.explanationImage,
      explanationVideoUrl: q.explanationVideoUrl,
      explanationVideoFile: q.explanationVideoFile,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChapterQuestions,
  getFullExamQuestions,
  submitAnswer,
  submitBatchAnswers,
  getSubjectForDownload,
};