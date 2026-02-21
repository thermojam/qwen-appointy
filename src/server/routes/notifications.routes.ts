import { Router } from 'express';
import { asyncHandler, successResponse } from '../middleware/errorHandler';
import { notificationService } from '../services/notification.service';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Validation schemas
const getNotificationsQuerySchema = z.object({
  type: z.enum([
    'APPOINTMENT_CREATED',
    'APPOINTMENT_CONFIRMED',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_REMINDER',
    'REVIEW_RECEIVED',
    'SYSTEM',
  ]).optional(),
  isRead: z.string().transform((val) => val === 'true').optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  offset: z.string().transform((val) => parseInt(val, 10)).optional(),
});

// Get all notifications for current user
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = getNotificationsQuerySchema.safeParse(req.query);
    const filters: Record<string, unknown> = {};

    if (query.success) {
      if (query.data.type) {
        filters.type = query.data.type;
      }
      if (query.data.isRead !== undefined) {
        filters.isRead = query.data.isRead;
      }
      if (query.data.limit) {
        filters.limit = query.data.limit;
      }
      if (query.data.offset) {
        filters.offset = query.data.offset;
      }
    }

    const notifications = await notificationService.getNotificationsByUser(
      req.user!.userId,
      filters
    );

    successResponse(res, notifications);
  })
);

// Get unread count
router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user!.userId);

    successResponse(res, { count });
  })
);

// Mark notification as read
router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    await notificationService.markAsRead(String(req.params.id), req.user!.userId);

    successResponse(res, { message: 'Notification marked as read' });
  })
);

// Mark all notifications as read
router.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user!.userId);

    successResponse(res, { message: 'All notifications marked as read' });
  })
);

// Delete notification
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(String(req.params.id), req.user!.userId);

    successResponse(res, { message: 'Notification deleted' });
  })
);

// Delete all read notifications
router.delete(
  '/read-all',
  asyncHandler(async (req, res) => {
    await notificationService.deleteAllRead(req.user!.userId);

    successResponse(res, { message: 'All read notifications deleted' });
  })
);

export default router;
