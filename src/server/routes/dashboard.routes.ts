import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { dashboardService } from '../services/dashboard.service';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.MASTER));

const getStatsQuerySchema = z.object({
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
});

// Get dashboard statistics
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const stats = await dashboardService.getDashboardStats(master.id);
    successResponse(res, stats);
  })
);

// Get upcoming appointments
router.get(
  '/upcoming',
  asyncHandler(async (req, res) => {
    const query = getStatsQuerySchema.safeParse(req.query);
    const limit = query.success && query.data.limit ? query.data.limit : 5;

    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const appointments = await dashboardService.getUpcomingAppointments(
      master.id,
      limit
    );

    successResponse(res, appointments);
  })
);

// Get recent activity
router.get(
  '/activity',
  asyncHandler(async (req, res) => {
    const query = getStatsQuerySchema.safeParse(req.query);
    const limit = query.success && query.data.limit ? query.data.limit : 10;

    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const activity = await dashboardService.getRecentActivity(master.id, limit);
    successResponse(res, activity);
  })
);

export default router;
