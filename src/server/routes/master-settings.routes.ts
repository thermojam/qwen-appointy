import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { masterSettingsService } from '../services/master-settings.service';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.MASTER));

// Validation schemas
const updateSettingsSchema = z.object({
  workFormat: z.enum(['ONLINE', 'OFFLINE', 'BOTH']).optional(),
  address: z.string().optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bookingConfirmationRequired: z.boolean().optional(),
  minCancellationTime: z.number().int().min(1).max(168).optional(),
  maxBookingLeadTime: z.number().int().min(1).max(365).optional(),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  experienceYears: z.number().int().min(0).max(50).optional(),
});

// Get master settings
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const settings = await masterSettingsService.getMasterSettings(
      req.user!.userId
    );

    successResponse(res, settings);
  })
);

// Update master settings (booking rules, work format, etc.)
router.patch(
  '/settings',
  asyncHandler(async (req, res) => {
    const data = updateSettingsSchema.parse(req.body);

    const updated = await masterSettingsService.updateMasterSettings(
      req.user!.userId,
      data
    );

    successResponse(res, updated);
  })
);

// Update master profile (name, description, avatar, experience)
router.patch(
  '/profile',
  asyncHandler(async (req, res) => {
    const data = updateProfileSchema.parse(req.body);

    const updated = await masterSettingsService.updateMasterProfile(
      req.user!.userId,
      data
    );

    successResponse(res, updated);
  })
);

// Update avatar only
router.patch(
  '/avatar',
  asyncHandler(async (req, res) => {
    const { avatarUrl } = z.object({
      avatarUrl: z.string().url(),
    }).parse(req.body);

    const updated = await masterSettingsService.updateAvatar(
      req.user!.userId,
      avatarUrl
    );

    successResponse(res, updated);
  })
);

// Delete/deactivate master profile
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await masterSettingsService.deleteMaster(req.user!.userId);

    successResponse(res, { message: 'Profile deactivated successfully' });
  })
);

export default router;
