const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireStudent, requireTeacher } = require('../middleware/role.middleware');
const validateMiddleware = require('../middleware/validate.middleware');
const { createQuizSchema, updateQuizSchema } = require('../schemas/quiz.schema');
const {
  getAllQuizzes,
  getMyQuizzes,
  getQuiz,
  getFullQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublish
} = require('../controllers/quiz.controller');

router.use(authMiddleware);

router.get('/', requireStudent, getAllQuizzes);
router.get('/mine', requireTeacher, getMyQuizzes);
router.get('/:id', requireStudent, getQuiz);
router.get('/:id/full', getFullQuiz); // role checked in controller
router.post('/', requireTeacher, validateMiddleware(createQuizSchema), createQuiz);
router.put('/:id', requireTeacher, validateMiddleware(updateQuizSchema), updateQuiz);
router.delete('/:id', requireTeacher, deleteQuiz);
router.patch('/:id/publish', requireTeacher, togglePublish);

module.exports = router;