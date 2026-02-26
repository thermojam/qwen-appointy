import { prisma } from '../db/prisma';
import { WorkFormat } from '@prisma/client';

interface SearchMastersInput {
  query?: string;
  workFormat?: WorkFormat;
  minRating?: number;
  maxPrice?: number;
  serviceId?: string;
  sortBy?: 'rating' | 'price' | 'reviews' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
}

export const searchService = {
  async searchMasters(data: SearchMastersInput) {
    const {
      query,
      workFormat,
      minRating,
      maxPrice,
      serviceId,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      latitude,
      longitude,
    } = data;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    // Filter by work format
    if (workFormat) {
      where.workFormat = workFormat;
    }

    // Filter by minimum rating
    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Search by query (fullName or description)
    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filter by service price
    if (maxPrice !== undefined || serviceId) {
      where.services = {
        some: {
          isActive: true,
        },
      };

      if (maxPrice !== undefined) {
        where.services.some.price = { lte: maxPrice };
      }

      if (serviceId) {
        where.services.some.id = serviceId;
      }
    }

    // Get total count
    const total = await prisma.master.count({ where });

    // Build order by
    const orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      case 'reviews':
        orderBy.totalReviews = sortOrder;
        break;
      case 'price':
        // Join with services for price sorting
        break;
      case 'distance':
        // Distance sorting requires latitude/longitude
        break;
    }

    // Fetch masters
    const masters = await prisma.master.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
          take: 5,
        },
      },
    });

    // Calculate distance if coordinates provided
    let results: any[] = masters;
    if (latitude !== undefined && longitude !== undefined) {
      results = masters.map((master) => {
        const distance = master.latitude && master.longitude
          ? this.calculateDistance(latitude, longitude, master.latitude, master.longitude)
          : null;
        return { ...master, distance };
      });

      // Sort by distance if needed
      if (sortBy === 'distance') {
        results.sort((a, b) => {
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance;
        });
      }
    }

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getMasterById(masterId: string) {
    const master = await prisma.master.findUnique({
      where: { id: masterId },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
        services: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        schedule: {
          orderBy: { date: 'asc' },
        },
        portfolio: {
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          select: {
            id: true,
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
          take: 20,
        },
      },
    });

    if (!master) {
      return null;
    }

    return master;
  },

  // Haversine formula for distance calculation (in km)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
