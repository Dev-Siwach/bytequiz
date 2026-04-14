const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRankings = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const rankings = await prisma.ranking.findMany({
      where: { quizId },
      include: {
        student: { select: { name: true } }
      },
      orderBy: { rank: 'asc' }
    });

    const data = rankings.map(r => ({
      rank: r.rank,
      studentName: r.student.name,
      score: r.score,
      timeTakenSecs: r.timeTakenSecs
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMyRanking = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;

    const ranking = await prisma.ranking.findUnique({
      where: { quizId_studentId: { quizId, studentId } },
      include: {
        student: { select: { name: true } }
      }
    });

    if (!ranking) {
      const err = new Error('Ranking not found');
      err.status = 404;
      throw err;
    }

    const data = {
      rank: ranking.rank,
      studentName: ranking.student.name,
      score: ranking.score,
      timeTakenSecs: ranking.timeTakenSecs
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRankings, getMyRanking };