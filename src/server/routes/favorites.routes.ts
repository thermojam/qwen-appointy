import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { AppError } from '../utils/errors';
import { prisma } from '../db/prisma';
import { authenticate } from '../middleware/auth';
import { loadProfile, roleMiddleware } from '../middleware/role.middleware';

const router = Router();

// Все routes требуют аутентификации
router.use(authenticate);
router.use(loadProfile);

// Get all favorites for current client
router.get(
  '/',
  roleMiddleware('CLIENT'),
  asyncHandler(async (req, res) => {
    const clientId = req.clientId!;

    const favorites = await prisma.favoriteMaster.findMany({
      where: { clientId },
      include: {
        master: {
          include: {
            services: {
              where: { isActive: true },
              select: { id: true, name: true, price: true, duration: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    successResponse(res, favorites);
  })
);

// Add master to favorites
router.post(
  '/',
  roleMiddleware('CLIENT'),
  asyncHandler(async (req, res) => {
    const clientId = req.clientId!;
    const { masterId } = req.body;

    if (!masterId) {
      throw AppError.badRequest('masterId is required');
    }

    // Check if master exists
    const master = await prisma.master.findUnique({
      where: { id: masterId },
    });

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    // Check if already favorited
    const existing = await prisma.favoriteMaster.findUnique({
      where: {
        masterId_clientId: {
          masterId,
          clientId,
        },
      },
    });

    if (existing) {
      throw AppError.conflict('Master already in favorites');
    }

    const favorite = await prisma.favoriteMaster.create({
      data: {
        masterId,
        clientId,
      },
      include: {
        master: {
          include: {
            services: {
              where: { isActive: true },
              select: { id: true, name: true, price: true, duration: true },
            },
          },
        },
      },
    });

    successResponse(res, favorite);
  })
);

// Remove master from favorites
router.delete(
  '/:masterId',
  roleMiddleware('CLIENT'),
  asyncHandler(async (req, res) => {
    const clientId = req.clientId!;
    const masterId = String(req.params.masterId);

    await prisma.favoriteMaster.delete({
      where: {
        masterId_clientId: {
          masterId,
          clientId,
        },
      },
    });

    successResponse(res, { message: 'Removed from favorites' });
  })
);

// Check if master is in favorites
router.get(
  '/check/:masterId',
  roleMiddleware('CLIENT'),
  asyncHandler(async (req, res) => {
    const clientId = req.clientId!;
    const masterId = String(req.params.masterId);

    const favorite = await prisma.favoriteMaster.findUnique({
      where: {
        masterId_clientId: {
          masterId,
          clientId,
        },
      },
    });

    successResponse(res, { isFavorite: !!favorite });
  })
);

export default router;
