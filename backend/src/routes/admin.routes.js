const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const {
  getUsers,
  createUser,
  deactivateUser,
  activateUser,
  resetPassword,
  getQuizzes
} = require('../controllers/admin.controller');

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/deactivate', deactivateUser);
router.patch('/users/:id/activate', activateUser);
router.patch('/users/:id/reset-password', resetPassword);
router.get('/quizzes', getQuizzes);

module.exports = router;