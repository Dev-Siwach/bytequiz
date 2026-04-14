const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    const err = new Error(`Forbidden: requires ${role} role`);
    err.status = 403;
    return next(err);
  }
  next();
};

const requireStudent = requireRole('STUDENT');
const requireTeacher = requireRole('TEACHER');
const requireAdmin = requireRole('ADMIN');

module.exports = { requireStudent, requireTeacher, requireAdmin };