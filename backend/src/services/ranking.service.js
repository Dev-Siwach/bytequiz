const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const recalculateRankings = async (quizId) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { quizId },
      orderBy: [
        { score: 'desc' },
        { timeTakenSecs: 'asc' }
      ]
    });

    let currentRank = 1;
    for (let i = 0; i < submissions.length; i++) {
      if (i > 0) {
        const prev = submissions[i - 1];
        const curr = submissions[i];
        if (prev.score !== curr.score || prev.timeTakenSecs !== curr.timeTakenSecs) {
          currentRank = i + 1;
        }
      }

      await prisma.ranking.upsert({
        where: {
          quizId_studentId: {
            quizId: quizId,
            studentId: submissions[i].studentId
          }
        },
        update: {
          rank: currentRank,
          score: submissions[i].score,
          timeTakenSecs: submissions[i].timeTakenSecs,
          submissionId: submissions[i].id
        },
        create: {
          quizId: quizId,
          studentId: submissions[i].studentId,
          submissionId: submissions[i].id,
          rank: currentRank,
          score: submissions[i].score,
          timeTakenSecs: submissions[i].timeTakenSecs
        }
      });
    }
  } catch (error) {
    console.error('Error recalculating rankings:', error);
  }
};

module.exports = { recalculateRankings };