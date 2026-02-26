import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { WorkFormat, OfflineMode } from '@prisma/client';

interface UpdateMasterSettingsInput {
  workFormat?: WorkFormat;
  offlineMode?: OfflineMode;
  address?: string;
  latitude?: number;
  longitude?: number;
  bookingConfirmationRequired?: boolean;
  minCancellationTime?: number;
  maxBookingLeadTime?: number;
}

interface UpdateMasterProfileInput {
  fullName?: string;
  description?: string;
  avatarUrl?: string;
  experienceYears?: number;
}

export const masterSettingsService = {
  async getMasterSettings(userId: string) {
    const master = await prisma.master.findUnique({
      where: { userId },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        schedule: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            breakStart: true,
            breakEnd: true,
          },
        },
      },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    return master;
  },

  async updateMasterSettings(
    userId: string,
    data: UpdateMasterSettingsInput
  ) {
    const master = await prisma.master.findUnique({
      where: { userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    // Validate booking settings
    if (data.minCancellationTime !== undefined) {
      if (data.minCancellationTime < 1 || data.minCancellationTime > 168) {
        throw AppError.badRequest(
          'Min cancellation time must be between 1 and 168 hours'
        );
      }
    }

    if (data.maxBookingLeadTime !== undefined) {
      if (data.maxBookingLeadTime < 1 || data.maxBookingLeadTime > 365) {
        throw AppError.badRequest(
          'Max booking lead time must be between 1 and 365 days'
        );
      }
    }

    const updated = await prisma.master.update({
      where: { userId },
      data,
    });

    return updated;
  },

  async updateMasterProfile(userId: string, data: UpdateMasterProfileInput) {
    const master = await prisma.master.findUnique({
      where: { userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    // Validate experience years
    if (data.experienceYears !== undefined) {
      if (data.experienceYears < 0 || data.experienceYears > 50) {
        throw AppError.badRequest(
          'Experience years must be between 0 and 50'
        );
      }
    }

    // Validate description length
    if (data.description !== undefined && data.description.length > 1000) {
      throw AppError.badRequest('Description must not exceed 1000 characters');
    }

    const updated = await prisma.master.update({
      where: { userId },
      data,
    });

    return updated;
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    const master = await prisma.master.findUnique({
      where: { userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    const updated = await prisma.master.update({
      where: { userId },
      data: { avatarUrl },
    });

    return updated;
  },

  async deleteMaster(userId: string) {
    const master = await prisma.master.findUnique({
      where: { userId },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    // Soft delete - mark as inactive
    await prisma.master.update({
      where: { userId },
      data: { isActive: false },
    });

    return { message: 'Master profile deactivated' };
  },
};
