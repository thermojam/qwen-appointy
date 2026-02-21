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
