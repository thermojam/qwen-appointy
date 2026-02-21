import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { scheduleService } from '../services/schedule.service';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { z } from 'zod';
import { createScheduleSchema } from '../validators';

const router = Router();

router.use(authenticate);

// Validation schemas
const updateScheduleSchema = createScheduleSchema.partial();

const getScheduleQuerySchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
});

// ====================================================
// MASTER ROUTES
// ====================================================

// Get all schedules for current master
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

    const query = getScheduleQuerySchema.safeParse(req.query);
    let schedules;

    if (query.success && query.data.dayOfWeek) {
      schedules = await prisma.schedule.findMany({
        where: {
          masterId: master.id,
          dayOfWeek: query.data.dayOfWeek,
        },
      });
    } else {
      schedules = await scheduleService.getScheduleByMaster(master.id);
    }

    successResponse(res, schedules);
  })
);

// Get single schedule by ID
router.get(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const schedule = await scheduleService.getScheduleById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || schedule.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    successResponse(res, schedule);
  })
);

// Create new schedule
router.post(
  '/',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const data = createScheduleSchema.parse(req.body);

    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const schedule = await scheduleService.createSchedule({
      ...data,
      masterId: master.id,
    });

    successResponse(res, schedule, 201);
  })
);

// Update schedule
router.patch(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const data = updateScheduleSchema.parse(req.body);

    const schedule = await scheduleService.getScheduleById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || schedule.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await scheduleService.updateSchedule(schedule.id, data);
    successResponse(res, updated);
  })
);

// Delete schedule
router.delete(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const schedule = await scheduleService.getScheduleById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || schedule.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    await scheduleService.deleteSchedule(schedule.id);
    successResponse(res, { message: 'Schedule deleted successfully' });
  })
);

// Toggle schedule active/inactive
router.post(
  '/:id/toggle',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const schedule = await scheduleService.getScheduleById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || schedule.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await scheduleService.toggleSchedule(schedule.id);
    successResponse(res, updated);
  })
);

// Get available slots for a specific date and service
router.get(
  '/:masterId/available-slots',
  asyncHandler(async (req, res) => {
    const masterId = String(req.params.masterId);
    const { date, serviceDuration } = req.query;

    if (!date || !serviceDuration) {
      throw AppError.badRequest('Date and serviceDuration are required');
    }

    const parsedDate = new Date(date as string);
    const parsedDuration = parseInt(serviceDuration as string, 10);

    if (isNaN(parsedDate.getTime())) {
      throw AppError.badRequest('Invalid date format');
    }

    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      throw AppError.badRequest('Invalid service duration');
    }

    const slots = await scheduleService.getAvailableSlots(
      masterId,
      parsedDate,
      parsedDuration
    );

    successResponse(res, slots);
  })
);

export default router;
