import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { AppError } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { loadProfile, roleMiddleware } from '../middleware/role.middleware';
import { favoriteService } from '../services/favorite.service';

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
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const favorites = await favoriteService.getFavorites(clientId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sortBy: sortBy as 'createdAt' | 'rating' | 'name',
      sortOrder: sortOrder as 'asc' | 'desc',
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

    const favorite = await favoriteService.addToFavorites(clientId, masterId);

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

    await favoriteService.removeFromFavorites(clientId, masterId);

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

    const isFavorite = await favoriteService.isFavorite(clientId, masterId);

    successResponse(res, { isFavorite });
  })
);

export default router;
