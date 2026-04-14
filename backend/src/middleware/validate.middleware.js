const validateMiddleware = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const err = new Error(error.errors[0]?.message || 'Validation error');
    err.status = 400;
    next(err);
  }
};

module.exports = validateMiddleware;