import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { WorkFormat } from '@prisma/client';

interface MasterOnboardingInput {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  description?: string;
  workFormat: WorkFormat;
  address?: string;
  latitude?: number;
  longitude?: number;
  experienceYears: number;
  bookingConfirmationRequired: boolean;
  minCancellationTime: number;
  maxBookingLeadTime: number;
}

interface ClientOnboardingInput {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  interests: string[];
}

export const onboardingService = {
  async completeMasterOnboarding(data: MasterOnboardingInput) {
    // Check if user exists and is MASTER
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (user.role !== 'MASTER') {
      throw AppError.forbidden('Only MASTER users can create master profiles');
    }

    // Check if master profile already exists
    const existingMaster = await prisma.master.findUnique({
      where: { userId: data.userId },
    });

    if (existingMaster) {
      throw AppError.conflict('Master profile already exists');
    }

    // Create master profile
    const master = await prisma.master.create({
      data: {
        userId: data.userId,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        description: data.description,
        workFormat: data.workFormat,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        experienceYears: data.experienceYears,
        bookingConfirmationRequired: data.bookingConfirmationRequired,
        minCancellationTime: data.minCancellationTime,
        maxBookingLeadTime: data.maxBookingLeadTime,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    // Update user status to ACTIVE
    await prisma.user.update({
      where: { id: data.userId },
      data: { status: 'ACTIVE' },
    });

    return master;
  },

  async completeClientOnboarding(data: ClientOnboardingInput) {
    // Check if user exists and is CLIENT
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (user.role !== 'CLIENT') {
      throw AppError.forbidden('Only CLIENT users can create client profiles');
    }

    // Check if client profile already exists
    const existingClient = await prisma.client.findUnique({
      where: { userId: data.userId },
    });

    if (existingClient) {
      throw AppError.conflict('Client profile already exists');
    }

    // Create client profile
    const client = await prisma.client.create({
      data: {
        userId: data.userId,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        interests: data.interests,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    // Update user status to ACTIVE
    await prisma.user.update({
      where: { id: data.userId },
      data: { status: 'ACTIVE' },
    });

    return client;
  },

  async getMasterProfile(userId: string) {
    const master = await prisma.master.findUnique({
      where: { userId },
      include: {
        services: {
          where: { isActive: true },
        },
        schedule: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            client: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        portfolio: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!master) {
      throw AppError.notFound('Master profile not found');
    }

    return master;
  },

  async getClientProfile(userId: string) {
    const client = await prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      throw AppError.notFound('Client profile not found');
    }

    return client;
  },

  async updateMasterProfile(userId: string, data: Partial<MasterOnboardingInput>) {
    const master = await prisma.master.update({
      where: { userId },
      data,
    });

    return master;
  },

  async updateClientProfile(userId: string, data: Partial<ClientOnboardingInput>) {
    const client = await prisma.client.update({
      where: { userId },
      data,
    });

    return client;
  },
};
