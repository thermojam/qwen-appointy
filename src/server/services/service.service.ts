import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';

interface CreateServiceInput {
  masterId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

interface UpdateServiceInput {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

export const serviceService = {
  async createService(data: CreateServiceInput) {
    // Verify master exists and belongs to user
    const master = await prisma.master.findUnique({
      where: { id: data.masterId },
    });

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    const service = await prisma.service.create({
      data: {
        masterId: data.masterId,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
      },
    });

    return service;
  },

  async updateService(serviceId: string, data: UpdateServiceInput) {
    const service = await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    return service;
  },

  async deleteService(serviceId: string) {
    await prisma.service.delete({
      where: { id: serviceId },
    });
  },

  async getServicesByMaster(masterId: string, isActive?: boolean) {
    const services = await prisma.service.findMany({
      where: {
        masterId,
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return services;
  },

  async getServiceById(serviceId: string) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        master: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!service) {
      throw AppError.notFound('Service not found');
    }

    return service;
  },
};
