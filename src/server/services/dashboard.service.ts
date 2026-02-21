import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';

interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalClients: number;
  totalReviews: number;
  averageRating: number;
}

export const dashboardService = {
  async getDashboardStats(masterId: string): Promise<DashboardStats> {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get appointments for today
    const todayAppointments = await prisma.appointment.count({
      where: {
        masterId,
        dateTime: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
    });

    // Get today's revenue (from completed appointments)
    const todayCompletedAppointments = await prisma.appointment.findMany({
      where: {
        masterId,
        dateTime: {
          gte: today,
          lt: tomorrow,
        },
        status: 'COMPLETED',
      },
      include: {
        service: {
          select: {
            price: true,
          },
        },
      },
    });

    const todayRevenue = todayCompletedAppointments.reduce(
      (sum, apt) => sum + Number(apt.service.price),
      0
    );

    // Get total appointments count
    const totalAppointments = await prisma.appointment.count({
      where: { masterId },
    });

    // Get pending appointments count
    const pendingAppointments = await prisma.appointment.count({
      where: {
        masterId,
        status: 'PENDING',
      },
    });

    // Get confirmed appointments count
    const confirmedAppointments = await prisma.appointment.count({
      where: {
        masterId,
        status: 'CONFIRMED',
      },
    });

    // Get unique clients count
    const uniqueClients = await prisma.appointment.groupBy({
      by: ['clientId'],
      where: { masterId },
    });
    const totalClients = uniqueClients.length;

    // Get reviews stats
    const reviews = await prisma.review.findMany({
      where: { masterId },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return {
      todayAppointments,
      todayRevenue,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      totalClients,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  },

  async getUpcomingAppointments(masterId: string, limit: number = 5) {
    const now = new Date();

    const appointments = await prisma.appointment.findMany({
      where: {
        masterId,
        dateTime: {
          gte: now,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { dateTime: 'asc' },
      take: limit,
    });

    return appointments;
  },

  async getRecentActivity(masterId: string, limit: number = 10) {
    const appointments = await prisma.appointment.findMany({
      where: { masterId },
      include: {
        service: {
          select: {
            name: true,
          },
        },
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return appointments;
  },
};
