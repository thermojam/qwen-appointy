import { prisma } from '../db/prisma';
import { AppError } from '../utils/errors';
import { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface GetNotificationsFilters {
  type?: NotificationType;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

export const notificationService = {
  async createNotification(data: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data,
    });

    return notification;
  },

  async getNotificationsByUser(userId: string, filters?: GetNotificationsFilters) {
    const where: Record<string, unknown> = {
      userId,
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return notifications;
  },

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    if (notification.userId !== userId) {
      throw AppError.forbidden('Access denied');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    if (notification.userId !== userId) {
      throw AppError.forbidden('Access denied');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  },

  async deleteAllRead(userId: string) {
    await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return { message: 'All read notifications deleted' };
  },

  // Helper methods for automatic notification creation
  async notifyAppointmentCreated(
    userId: string,
    appointmentId: string,
    clientName: string,
    serviceName: string,
    dateTime: Date
  ) {
    return this.createNotification({
      userId,
      type: 'APPOINTMENT_CREATED',
      title: 'Новая запись',
      message: `Клиент ${clientName} записался на услугу "${serviceName}" на ${dateTime.toLocaleDateString('ru-RU')}`,
    });
  },

  async notifyAppointmentConfirmed(
    userId: string,
    clientName: string,
    serviceName: string,
    dateTime: Date
  ) {
    return this.createNotification({
      userId,
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Запись подтверждена',
      message: `Ваша запись на "${serviceName}" на ${dateTime.toLocaleDateString('ru-RU')} подтверждена`,
    });
  },

  async notifyAppointmentCancelled(
    userId: string,
    clientName: string,
    serviceName: string,
    dateTime: Date,
    reason?: string
  ) {
    return this.createNotification({
      userId,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Запись отменена',
      message: `Запись на "${serviceName}" отменена. ${reason || ''}`,
    });
  },

  async notifyReviewReceived(
    userId: string,
    clientName: string,
    rating: number
  ) {
    return this.createNotification({
      userId,
      type: 'REVIEW_RECEIVED',
      title: 'Новый отзыв',
      message: `Клиент ${clientName} оставил отзыв с оценкой ${rating}★`,
    });
  },
};
