import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { serviceService } from '../services/service.service';
import { createServiceSchema, updateServiceSchema } from '../validators';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { AppError } from '../utils/errors';
import { prisma } from '../db/prisma';

const router = Router();

router.use(authenticate);

// Get all services for current master
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

    const services = await serviceService.getServicesByMaster(master.id);
    successResponse(res, services);
  })
);

// Create new service
router.post(
  '/',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const data = createServiceSchema.parse(req.body);
    
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const service = await serviceService.createService({
      ...data,
      masterId: master.id,
    });
    
    successResponse(res, service, 201);
  })
);

// Get service by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const service = await serviceService.getServiceById(String(req.params.id));
    successResponse(res, service);
  })
);

// Update service
router.patch(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const data = updateServiceSchema.parse(req.body);

    const service = await serviceService.getServiceById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || master.id !== service.masterId) {
      throw AppError.forbidden('You can only update your own services');
    }

    const updated = await serviceService.updateService(service.id, data);
    successResponse(res, updated);
  })
);

// Delete service
router.delete(
  '/:id',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const service = await serviceService.getServiceById(String(req.params.id));

    // Verify ownership
    const master = await prisma.master.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!master || master.id !== service.masterId) {
      throw AppError.forbidden('You can only delete your own services');
    }

    await serviceService.deleteService(service.id);
    successResponse(res, { message: 'Service deleted successfully' });
  })
);

export default router;
