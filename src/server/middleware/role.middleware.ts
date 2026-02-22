import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';

// Расширяем интерфейс Request для хранения clientId и masterId
declare global {
  namespace Express {
    interface Request {
      clientId?: string;
      masterId?: string;
    }
  }
}

/**
 * Middleware для получения ID клиента/мастера из userId
 * Должен использоваться после authenticate
 */
export const loadProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required'));
  }

  try {
    if (req.user.role === 'CLIENT') {
      const client = await prisma.client.findUnique({
        where: { userId: req.user.userId },
        select: { id: true },
      });

      if (!client) {
        return next(AppError.notFound('Client profile not found'));
      }

      req.clientId = client.id;
    } else if (req.user.role === 'MASTER') {
      const master = await prisma.master.findUnique({
        where: { userId: req.user.userId },
        select: { id: true },
      });

      if (!master) {
        return next(AppError.notFound('Master profile not found'));
      }

      req.masterId = master.id;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware для проверки роли
 */
export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
};
