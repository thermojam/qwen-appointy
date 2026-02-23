'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Notification, NotificationType } from '@/shared/types/api';
import { Sidebar } from '@/features/dashboard/ui/sidebar';
import { useCurrentUser, useLogout } from '@/features/auth/hooks/auth.hooks';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Star,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const notificationConfig: Record<
  NotificationType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }
> = {
  APPOINTMENT_CREATED: {
    label: 'Новая запись',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  APPOINTMENT_CONFIRMED: {
    label: 'Подтверждение',
    icon: Check,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  APPOINTMENT_CANCELLED: {
    label: 'Отмена',
    icon: X,
    color: 'text-error',
    bgColor: 'bg-error/10',
  },
  APPOINTMENT_REMINDER: {
    label: 'Напоминание',
    icon: Bell,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  REVIEW_RECEIVED: {
    label: 'Отзыв',
    icon: Star,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  SYSTEM: {
    label: 'Системное',
    icon: Info,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
};

const typeFilters: Array<{ value: NotificationType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Все' },
  { value: 'APPOINTMENT_CREATED', label: 'Записи' },
  { value: 'APPOINTMENT_CONFIRMED', label: 'Подтверждения' },
  { value: 'APPOINTMENT_CANCELLED', label: 'Отмены' },
  { value: 'REVIEW_RECEIVED', label: 'Отзывы' },
  { value: 'SYSTEM', label: 'Системные' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<NotificationType | 'ALL'>('ALL');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  
  const currentUserQuery = useCurrentUser();
  const logout = useLogout();
  const currentUser = currentUserQuery.data;

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', selectedType, showOnlyUnread],
    queryFn: () => {
      const filters: Record<string, unknown> = {};
      if (selectedType !== 'ALL') {
        filters.type = selectedType;
      }
      if (showOnlyUnread) {
        filters.isRead = false;
      }
      return api.notifications.getAll(filters);
    },
    enabled: !!currentUser,
    refetchInterval: 10000, // Обновлять каждые 10 секунд для уведомлений
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api.notifications.getUnreadCount(),
    enabled: !!currentUser,
    refetchInterval: 10000, // Обновлять каждые 10 секунд
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: (id: string) => api.notifications.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteAllRead = useMutation({
    mutationFn: () => api.notifications.deleteAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = currentUser;
  const masterData = user.master;

  const unreadCount = unreadCountData?.count || 0;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'Только что';
    } else if (minutes < 60) {
      return `${minutes} мин. назад`;
    } else if (hours < 24) {
      return `${hours} ч. назад`;
    } else if (days < 7) {
      return `${days} дн. назад`;
    } else {
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        user={{
          fullName: masterData?.fullName,
          email: user.email,
          avatar: masterData?.avatarUrl,
        }}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={cn(
        'p-8 transition-all duration-300 ease-in-out',
        'ml-20 md:ml-20 lg:ml-64'
      )}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-2">Уведомления</h1>
              <p className="text-muted-foreground">
                Будьте в курсе всех событий
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  {unreadCount} новых
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Type Filters */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {typeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedType === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(filter.value)}
                className="flex-shrink-0"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              className={cn(
                'flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors',
                showOnlyUnread
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Bell className="w-4 h-4" />
              Только непрочитанные
            </button>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Прочитать все
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteAllRead.mutate()}
                disabled={deleteAllRead.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить прочитанные
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Config = notificationConfig[notification.type];
              const Icon = Config.icon;

              return (
                <Card
                  key={notification.id}
                  className={cn(
                    'card-hover rounded-2xl border-border/50 transition-colors',
                    !notification.isRead && 'bg-primary/5 border-primary/20'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          Config.bgColor
                        )}
                      >
                        <Icon className={cn('w-5 h-5', Config.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-semibold text-sm mb-0.5">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(notification.createdAt)}
                          </span>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              Config.bgColor,
                              Config.color
                            )}
                          >
                            {Config.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead.mutate(notification.id)}
                            disabled={markAsRead.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification.mutate(notification.id)}
                          disabled={deleteNotification.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {showOnlyUnread
                  ? 'Нет непрочитанных уведомлений'
                  : selectedType !== 'ALL'
                  ? `Нет уведомлений типа "${typeFilters.find((f) => f.value === selectedType)?.label}"`
                  : 'Уведомлений пока нет'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
