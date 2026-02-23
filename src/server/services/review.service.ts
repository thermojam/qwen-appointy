import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { notificationService } from './notification.service';

interface GetReviewsFilters {
  minRating?: number;
  maxRating?: number;
  limit?: number;
  offset?: number;
}

interface CreateReviewInput {
  masterId: string;
  clientId: string;
  rating: number;
  comment?: string;
}

export const reviewService = {
  async getReviewsByMaster(masterId: string, filters?: GetReviewsFilters) {
    const where: Record<string, unknown> = {
      masterId,
    };

    if (filters?.minRating !== undefined || filters?.maxRating !== undefined) {
      where.rating = {} as Record<string, number>;
      if (filters?.minRating !== undefined) {
        (where.rating as Record<string, number>).gte = filters.minRating;
      }
      if (filters?.maxRating !== undefined) {
        (where.rating as Record<string, number>).lte = filters.maxRating;
      }
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return reviews;
  },

  async getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!review) {
      throw AppError.notFound('Review not found');
    }

    return review;
  },

  async createReview(data: CreateReviewInput) {
    // Проверяем, что мастер существует
    const master = await prisma.master.findUnique({
      where: { id: data.masterId },
    });

    if (!master) {
      throw AppError.notFound('Master not found');
    }

    // Проверяем, что клиент существует
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw AppError.notFound('Client not found');
    }

    // Проверяем, есть ли уже отзыв от этого клиента этому мастеру
    const existingReview = await prisma.review.findUnique({
      where: {
        masterId_clientId: {
          masterId: data.masterId,
          clientId: data.clientId,
        },
      },
    });

    if (existingReview) {
      throw AppError.conflict('Вы уже оставляли отзыв этому мастеру. Вы можете обновить существующий отзыв.');
    }

    // Проверяем, что у клиента была завершённая запись к этому мастеру
    const completedAppointment = await prisma.appointment.findFirst({
      where: {
        masterId: data.masterId,
        clientId: data.clientId,
        status: 'COMPLETED',
      },
    });

    if (!completedAppointment) {
      throw AppError.forbidden('Вы можете оставить отзыв только после завершения услуги. Дождитесь статуса "Завершено".');
    }

    // Создаём отзыв
    const review = await prisma.review.create({
      data: {
        masterId: data.masterId,
        clientId: data.clientId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Обновляем рейтинг мастера
    await this.updateMasterRating(data.masterId);

    // Создаём уведомление для мастера
    const clientName = client.fullName || 'Клиент';
    await notificationService.notifyReviewReceived(
      master.userId,
      clientName,
      data.rating
    );

    console.log('[ReviewService] Review created:', {
      id: review.id,
      masterId: data.masterId,
      clientId: data.clientId,
      rating: data.rating,
    });

    return review;
  },

  async updateReview(reviewId: string, data: { rating?: number; comment?: string }) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw AppError.notFound('Review not found');
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.comment !== undefined && { comment: data.comment }),
      },
      include: {
        client: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Обновляем рейтинг мастера
    await this.updateMasterRating(review.masterId);

    return updated;
  },

  async getReviewStats(masterId: string) {
    const reviews = await prisma.review.findMany({
      where: { masterId },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution,
    };
  },

  async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw AppError.notFound('Review not found');
    }

    // Only admin or the master can delete reviews
    const master = await prisma.master.findUnique({
      where: { userId },
    });

    if (!master || master.id !== review.masterId) {
      throw AppError.forbidden('Access denied');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update master rating
    await this.updateMasterRating(review.masterId);
  },

  async updateMasterRating(masterId: string) {
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

    await prisma.master.update({
      where: { id: masterId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
    });

    return { averageRating, totalReviews };
  },
};
