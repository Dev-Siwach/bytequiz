const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireStudent } = require('../middleware/role.middleware');
const { getRankings, getMyRanking } = require('../controllers/ranking.controller');

router.use(authMiddleware);

router.get('/:quizId', requireStudent, getRankings);
router.get('/:quizId/mine', requireStudent, getMyRanking);

module.exports = router;