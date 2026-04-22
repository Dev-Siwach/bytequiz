const { PrismaClient } = require('@prisma/client');
const { recalculateRankings } = require('../services/ranking.service');
const prisma = new PrismaClient();

const submit = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { timeTakenSecs, answers } = req.body;
    const studentId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz || !quiz.isPublished) {
      const err = new Error('Quiz not found or not published');
      err.status = 404;
      throw err;
    }

    const existing = await prisma.submission.findUnique({
      where: { studentId_quizId: { studentId, quizId } }
    });
    if (existing) {
      const err = new Error('Already submitted');
      err.status = 409;
      throw err;
    }

    let correctQ = 0;
    const totalQ = quiz.questions.length;

    const submissionAnswers = answers.map(ans => {
      const question = quiz.questions.find(q => q.id === ans.questionId);
      const isCorrect = question ? question.correctOption === ans.chosenOption : false;
      if (isCorrect) correctQ++;
      return {
        questionId: ans.questionId,
        chosenOption: ans.chosenOption,
        isCorrect
      };
    });

    const score = totalQ > 0 ? (correctQ / totalQ) * 100 : 0;

    const submission = await prisma.submission.create({
      data: {
        studentId,
        quizId,
        timeTakenSecs,
        score,
        totalQ,
        correctQ,
        answers: {
          create: submissionAnswers
        }
      },
      include: { answers: true }
    });

    // Recalculate rankings async without blocking
    recalculateRankings(quizId).catch(err => console.error(err));

    // Return the full submission result including per-question details
    const resultAnswers = submission.answers.map(ans => {
      const question = quiz.questions.find(q => q.id === ans.questionId);
      return {
        ...ans,
        correctOption: question.correctOption,
        explanation: question.explanation,
        question: {
          text: question.text,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctOption: question.correctOption,
          explanation: question.explanation
        }
      };
    });

    res.status(201).json({
      success: true,
      data: {
        ...submission,
        answers: resultAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMySubmission = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;

    const submission = await prisma.submission.findUnique({
      where: { studentId_quizId: { studentId, quizId } },
      include: {
        answers: true,
        quiz: {
          include: { questions: true }
        }
      }
    });

    if (!submission) {
      const err = new Error('Submission not found');
      err.status = 404;
      throw err;
    }

    const data = {
      id: submission.id,
      quizId: submission.quizId,
      timeTakenSecs: submission.timeTakenSecs,
      score: submission.score,
      totalQ: submission.totalQ,
      correctQ: submission.correctQ,
      submittedAt: submission.submittedAt,
      answers: submission.answers.map(ans => {
        const question = submission.quiz.questions.find(q => q.id === ans.questionId);
        return {
          id: ans.id,
          questionId: ans.questionId,
          chosenOption: ans.chosenOption,
          isCorrect: ans.isCorrect,
          correctOption: question.correctOption,
          explanation: question.explanation,
          question: {
            text: question.text,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctOption: question.correctOption,
            explanation: question.explanation
          }
        };
      })
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getQuizSubmissions = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz || quiz.createdById !== req.user.id) {
      const err = new Error('Quiz not found or forbidden');
      err.status = 403;
      throw err;
    }

    const submissions = await prisma.submission.findMany({
      where: { quizId },
      include: {
        student: { select: { name: true, email: true } }
      }
    });

    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        answers: true,
        quiz: {
          include: { questions: true }
        }
      }
    });

    if (!submission) {
      const err = new Error('Submission not found');
      err.status = 404;
      throw err;
    }

    // Students can only see their own submissions
    if (userRole === 'STUDENT' && submission.studentId !== userId) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }

    // Teachers can only see submissions for quizzes they created
    if (userRole === 'TEACHER' && submission.quiz.createdById !== userId) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }

    const data = {
      id: submission.id,
      quizId: submission.quizId,
      timeTakenSecs: submission.timeTakenSecs,
      score: submission.score,
      totalQ: submission.totalQ,
      correctQ: submission.correctQ,
      submittedAt: submission.submittedAt,
      answers: submission.answers.map(ans => {
        const question = submission.quiz.questions.find(q => q.id === ans.questionId);
        return {
          id: ans.id,
          questionId: ans.questionId,
          chosenOption: ans.chosenOption,
          isCorrect: ans.isCorrect,
          correctOption: question.correctOption,
          explanation: question.explanation,
          question: {
            text: question.text,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctOption: question.correctOption,
            explanation: question.explanation
          }
        };
      })
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { submit, getMySubmission, getQuizSubmissions, getSubmissionById };