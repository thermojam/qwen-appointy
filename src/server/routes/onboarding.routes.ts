import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { onboardingService } from '../services/onboarding.service';
import { masterOnboardingSchema, clientOnboardingSchema } from '../validators';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All onboarding routes require authentication
router.use(authenticate);

// Master onboarding
router.post(
  '/master',
  authorize(UserRole.MASTER),
  asyncHandler(async (req, res) => {
    const data = masterOnboardingSchema.parse(req.body);
    const master = await onboardingService.completeMasterOnboarding({
      ...data,
      userId: req.user!.userId,
    });
    successResponse(res, master, 201);
  })
);

// Client onboarding
router.post(
  '/client',
  authorize(UserRole.CLIENT),
  asyncHandler(async (req, res) => {
    const data = clientOnboardingSchema.parse(req.body);
    const client = await onboardingService.completeClientOnboarding({
      ...data,
      userId: req.user!.userId,
    });
    successResponse(res, client, 201);
  })
);

// Get current user's profile
router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    const { userId, role } = req.user!;
    
    if (role === UserRole.MASTER) {
      const master = await onboardingService.getMasterProfile(userId);
      successResponse(res, master);
    } else {
      const client = await onboardingService.getClientProfile(userId);
      successResponse(res, client);
    }
  })
);

export default router;
