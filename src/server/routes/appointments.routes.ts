import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { appointmentService } from '../services/appointment.service';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Validation schemas
const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
});

const getAppointmentsQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ====================================================
// MASTER ROUTES
// ====================================================

// Get all appointments for current master with optional filters
router.get(
  '/master',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const query = getAppointmentsQuerySchema.safeParse(req.query);
    const filters: Record<string, unknown> = {};

    if (query.success) {
      if (query.data.status) {
        filters.status = query.data.status;
      }
      if (query.data.startDate) {
        filters.startDate = new Date(query.data.startDate);
      }
      if (query.data.endDate) {
        filters.endDate = new Date(query.data.endDate);
      }
    }

    const appointments = await appointmentService.getAppointmentsByMaster(
      master.id,
      filters
    );

    successResponse(res, appointments);
  })
);

// Get single appointment by ID (master view)
router.get(
  '/master/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(
      String(req.params.id)
    );

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || appointment.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    successResponse(res, appointment);
  })
);

// Update appointment status
router.patch(
  '/master/:id/status',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const { status } = updateStatusSchema.parse(req.body);

    const appointment = await appointmentService.getAppointmentById(
      String(req.params.id)
    );

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || appointment.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await appointmentService.updateStatus(appointment.id, { status });
    successResponse(res, updated);
  })
);

// Confirm appointment (shortcut)
router.post(
  '/master/:id/confirm',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(
      String(req.params.id)
    );

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || appointment.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await appointmentService.confirmAppointment(appointment.id);
    successResponse(res, updated);
  })
);

// Cancel appointment (shortcut)
router.post(
  '/master/:id/cancel',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(
      String(req.params.id)
    );

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || appointment.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await appointmentService.cancelAppointment(appointment.id);
    successResponse(res, updated);
  })
);

// Complete appointment (shortcut)
router.post(
  '/master/:id/complete',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(
      String(req.params.id)
    );

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || appointment.masterId !== master.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await appointmentService.completeAppointment(appointment.id);
    successResponse(res, updated);
  })
);

// ====================================================
// CLIENT ROUTES
// ====================================================

// Get all appointments for current client
router.get(
  '/client',
  authorize(UserRole.CLIENT),
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!client) {
      throw AppError.notFound('Client profile not found');
    }

    const appointments = await appointmentService.getAppointmentsByClient(client.id);
    successResponse(res, appointments);
  })
);

// Get single appointment by ID (client view)
router.get(
  '/client/:id',
  authorize(UserRole.CLIENT),
  asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(
      String(req.params.id)
    );

    // Verify ownership
    const client = await prisma.client.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!client || appointment.clientId !== client.id) {
      throw AppError.forbidden('Access denied');
    }

    successResponse(res, appointment);
  })
);

// Cancel own appointment (client)
router.post(
  '/client/:id/cancel',
  authorize(UserRole.CLIENT),
  asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(
      String(req.params.id)
    );

    // Verify ownership
    const client = await prisma.client.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!client || appointment.clientId !== client.id) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await appointmentService.cancelAppointment(appointment.id);
    successResponse(res, updated);
  })
);

// Create new appointment (client)
const createAppointmentSchema = z.object({
  masterId: z.string().uuid(),
  serviceId: z.string().uuid(),
  dateTime: z.string().datetime(),
  comment: z.string().optional(),
});

router.post(
  '/client',
  authorize(UserRole.CLIENT),
  asyncHandler(async (req, res) => {
    const client = await prisma.client.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!client) {
      throw AppError.notFound('Client profile not found');
    }

    const data = createAppointmentSchema.parse(req.body);

    const appointment = await appointmentService.createAppointment({
      ...data,
      clientId: client.id,
    });

    successResponse(res, appointment);
  })
);

export default router;
