import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { portfolioService } from '../services/portfolio.service';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Validation schemas
const createPortfolioSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  title: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
});

const updatePortfolioSchema = z.object({
  title: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
});

// ====================================================
// MASTER ROUTES
// ====================================================

// Get all portfolio items for current master
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

    const portfolio = await portfolioService.getPortfolioByMaster(master.id);
    successResponse(res, portfolio);
  })
);

// Get single portfolio item by ID
router.get(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const portfolio = await portfolioService.getPortfolioById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || portfolio.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    successResponse(res, portfolio);
  })
);

// Create new portfolio item
router.post(
  '/',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const data = createPortfolioSchema.parse(req.body);

    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const portfolio = await portfolioService.createPortfolio({
      ...data,
      masterId: master.id,
    });

    successResponse(res, portfolio, 201);
  })
);

// Update portfolio item
router.patch(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const data = updatePortfolioSchema.parse(req.body);

    const portfolio = await portfolioService.getPortfolioById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || portfolio.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await portfolioService.updatePortfolio(portfolio.id, data);
    successResponse(res, updated);
  })
);

// Delete portfolio item
router.delete(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const portfolio = await portfolioService.getPortfolioById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || portfolio.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    await portfolioService.deletePortfolio(portfolio.id);
    successResponse(res, { message: 'Portfolio item deleted successfully' });
  })
);

export default router;
