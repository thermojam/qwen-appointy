'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Appointment, AppointmentStatus } from '@/shared/types/api';
import { Sidebar } from '@/features/dashboard/ui/sidebar';
import { useCurrentUser, useLogout } from '@/features/auth/hooks/auth.hooks';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const statusConfig: Record<
  AppointmentStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ElementType;
  }
> = {
  PENDING: {
    label: 'Ожидает',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: 'Подтверждено',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: CheckCircle,
  },
  COMPLETED: {
    label: 'Завершено',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Отменено',
    color: 'text-error',
    bgColor: 'bg-error/10',
    icon: XCircle,
  },
  NO_SHOW: {
    label: 'Не явился',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: XCircle,
  },
};

const statusFilters: Array<{ value: AppointmentStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Все' },
  { value: 'PENDING', label: 'Ожидают' },
  { value: 'CONFIRMED', label: 'Подтверждены' },
  { value: 'COMPLETED', label: 'Завершены' },
  { value: 'CANCELLED', label: 'Отменены' },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'ALL'>('ALL');
  
  const currentUserQuery = useCurrentUser();
  const logout = useLogout();
  const currentUser = currentUserQuery.data;

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', selectedStatus],
    queryFn: () => {
      const filters = selectedStatus !== 'ALL' ? { status: selectedStatus } : undefined;
      return api.appointments.getMasterAppointments(filters);
    },
    enabled: !!currentUser,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      api.appointments.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const confirmAppointment = useMutation({
    mutationFn: (id: string) => api.appointments.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: (id: string) => api.appointments.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const completeAppointment = useMutation({
    mutationFn: (id: string) => api.appointments.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
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

  const filteredAppointments = appointments?.filter((apt) => {
    if (selectedStatus === 'ALL') return true;
    return apt.status === selectedStatus;
  });

  const getStatusActions = (appointment: Appointment) => {
    const actions: Array<{
      label: string;
      onClick: () => void;
      variant: 'default' | 'outline' | 'ghost' | 'destructive';
      disabled: boolean;
    }> = [];

    if (appointment.status === 'PENDING') {
      actions.push({
        label: 'Подтвердить',
        onClick: () => confirmAppointment.mutate(appointment.id),
        variant: 'default',
        disabled: confirmAppointment.isPending,
      });
      actions.push({
        label: 'Отменить',
        onClick: () => cancelAppointment.mutate(appointment.id),
        variant: 'destructive',
        disabled: cancelAppointment.isPending,
      });
    }

    if (appointment.status === 'CONFIRMED') {
      actions.push({
        label: 'Завершить',
        onClick: () => completeAppointment.mutate(appointment.id),
        variant: 'default',
        disabled: completeAppointment.isPending,
      });
      actions.push({
        label: 'Отменить',
        onClick: () => cancelAppointment.mutate(appointment.id),
        variant: 'destructive',
        disabled: cancelAppointment.isPending,
      });
    }

    return actions;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Записи</h1>
          <p className="text-muted-foreground">
            Управление записями клиентов
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto">
          <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedStatus === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(filter.value)}
              className="flex-shrink-0"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : filteredAppointments && filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const StatusIcon = statusConfig[appointment.status].icon;
              const actions = getStatusActions(appointment);

              return (
                <Card
                  key={appointment.id}
                  className="card-hover rounded-3xl border-border/50"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Client & Service Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                            {appointment.client?.avatarUrl ? (
                              <img
                                src={appointment.client.avatarUrl}
                                alt={appointment.client?.fullName || 'Client'}
                                className="w-full h-full rounded-2xl object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-heading text-lg font-semibold mb-1">
                              {appointment.client?.fullName || 'Клиент'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Briefcase className="w-4 h-4" />
                              <span>{appointment.service?.name || 'Услуга'}</span>
                            </div>
                            {appointment.service?.description && (
                              <p className="text-sm text-muted-foreground">
                                {appointment.service.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(appointment.dateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(appointment.dateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.service?.duration || 0} мин</span>
                          </div>
                        </div>

                        {/* Comment */}
                        {appointment.comment && (
                          <div className="mt-3 p-3 bg-secondary rounded-xl">
                            <p className="text-sm text-muted-foreground">
                              {appointment.comment}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <div
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                            statusConfig[appointment.status].bgColor,
                            statusConfig[appointment.status].color
                          )}
                        >
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusConfig[appointment.status].label}</span>
                        </div>

                        <div className="text-2xl font-bold">
                          {appointment.service?.price || 0} ₽
                        </div>

                        {/* Action Buttons */}
                        {actions.length > 0 && (
                          <div className="flex gap-2">
                            {actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant}
                                size="sm"
                                onClick={action.onClick}
                                disabled={action.disabled}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {selectedStatus === 'ALL'
                ? 'У вас пока нет записей'
                : `Нет записей со статусом "${statusFilters.find((f) => f.value === selectedStatus)?.label}"`}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
