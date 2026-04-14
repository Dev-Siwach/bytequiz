const { verify } = require('../utils/jwt.utils');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('No token provided');
      err.status = 401;
      throw err;
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verify(token);
    } catch (e) {
      const err = new Error('Invalid token');
      err.status = 401;
      throw err;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      const err = new Error('User is deactivated or not found');
      err.status = 401;
      throw err;
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;