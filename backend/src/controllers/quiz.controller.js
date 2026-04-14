const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { isPublished: true },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { questions: true } }
      }
    });

    const data = quizzes.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      questionCount: q._count.questions,
      createdBy: q.createdBy.name
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { createdById: req.user.id },
      include: {
        _count: { select: { questions: true } }
      }
    });
    
    const data = quizzes.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      isPublished: q.isPublished,
      questionCount: q._count.questions,
      createdAt: q.createdAt
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findFirst({
      where: { id, isPublished: true },
      include: { questions: { orderBy: { order: 'asc' } } }
    });

    if (!quiz) {
      const err = new Error('Quiz not found');
      err.status = 404;
      throw err;
    }

    const data = {
      ...quiz,
      questions: quiz.questions.map(q => {
        const { correctOption, explanation, ...rest } = q;
        return rest;
      })
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getFullQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } }
    });

    if (!quiz) {
      const err = new Error('Quiz not found');
      err.status = 404;
      throw err;
    }

    if (quiz.createdById !== req.user.id && req.user.role !== 'ADMIN') {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const { title, description, isPublished, questions } = req.body;
    
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        isPublished,
        createdById: req.user.id,
        questions: {
          create: questions
        }
      }
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, isPublished, questions } = req.body;

    const existing = await prisma.quiz.findUnique({ where: { id } });
    if (!existing || existing.createdById !== req.user.id) {
      const err = new Error('Quiz not found or forbidden');
      err.status = 403;
      throw err;
    }

    await prisma.question.deleteMany({ where: { quizId: id } });

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        description,
        isPublished,
        questions: {
          create: questions
        }
      }
    });

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.quiz.findUnique({ where: { id } });
    if (!existing || existing.createdById !== req.user.id) {
      const err = new Error('Quiz not found or forbidden');
      err.status = 403;
      throw err;
    }

    await prisma.quiz.delete({ where: { id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.quiz.findUnique({ where: { id } });
    if (!existing || existing.createdById !== req.user.id) {
      const err = new Error('Quiz not found or forbidden');
      err.status = 403;
      throw err;
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { isPublished: !existing.isPublished }
    });

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  getMyQuizzes,
  getQuiz,
  getFullQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublish
};