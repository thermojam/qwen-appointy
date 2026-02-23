import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { reviewService } from '../services/review.service';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Validation schemas
const getReviewsQuerySchema = z.object({
  minRating: z.string().transform((val) => parseInt(val, 10)).optional(),
  maxRating: z.string().transform((val) => parseInt(val, 10)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  offset: z.string().transform((val) => parseInt(val, 10)).optional(),
});

const createReviewSchema = z.object({
  masterId: z.string().uuid('Invalid master ID'),
  rating: z.number().int().min(1).max(5, 'Рейтинг должен быть от 1 до 5'),
  comment: z.string().max(1000, 'Комментарий не должен превышать 1000 символов').optional().or(z.literal('')),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional().or(z.literal('')),
});

// Get all reviews for current master
router.get(
  '/',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const query = getReviewsQuerySchema.safeParse(req.query);
    const filters: Record<string, unknown> = {};

    if (query.success) {
      if (query.data.minRating) {
        filters.minRating = query.data.minRating;
      }
      if (query.data.maxRating) {
        filters.maxRating = query.data.maxRating;
      }
      if (query.data.limit) {
        filters.limit = query.data.limit;
      }
      if (query.data.offset) {
        filters.offset = query.data.offset;
      }
    }

    const reviews = await reviewService.getReviewsByMaster(master.id, filters);
    successResponse(res, reviews);
  })
);

// Get review stats for current master
router.get(
  '/stats',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const stats = await reviewService.getReviewStats(master.id);
    successResponse(res, stats);
  })
);

// Create new review (CLIENT only)
router.post(
  '/',
  authorize(UserRole.CLIENT),
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!client) {
      throw AppError.notFound('Client profile not found');
    }

    const data = createReviewSchema.parse(req.body);

    const review = await reviewService.createReview({
      ...data,
      clientId: client.id,
    });

    successResponse(res, review, 201);
  })
);

// Update existing review (CLIENT only)
router.patch(
  '/:id',
  authorize(UserRole.CLIENT),
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!client) {
      throw AppError.notFound('Client profile not found');
    }

    const review = await reviewService.getReviewById(String(req.params.id));

    // Проверяем, что клиент владеет отзывом
    if (review.clientId !== client.id) {
      throw AppError.forbidden('Access denied');
    }

    const data = updateReviewSchema.parse(req.body);

    const updated = await reviewService.updateReview(review.id, data);
    successResponse(res, updated);
  })
);

// Get single review by ID
router.get(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const review = await reviewService.getReviewById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || review.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    successResponse(res, review);
  })
);

// Delete review
router.delete(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const review = await reviewService.getReviewById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || review.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    await reviewService.deleteReview(review.id, req.user!.userId);
    successResponse(res, { message: 'Review deleted successfully' });
  })
);

export default router;
