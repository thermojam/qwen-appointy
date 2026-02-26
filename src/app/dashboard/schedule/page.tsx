'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { CreateScheduleInput } from '@/shared/types/api';
import { Sidebar } from '@/features/dashboard/ui/sidebar';
import { useCurrentUser } from '@/features/auth/hooks/auth.hooks';
import { ScheduleCalendar } from '@/features/dashboard/ui/schedule/ScheduleCalendar';
import { ScheduleEditor } from '@/features/dashboard/ui/schedule/ScheduleEditor';
import { ScheduleDateNotSelected } from '@/features/dashboard/ui/schedule/ScheduleDateNotSelected';
import { cn } from '@/shared/lib/utils';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data;

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedule'],
    queryFn: () => api.schedule.getAll(),
    enabled: !!currentUser,
  });

  const selectedDateStr = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : null;
  // s.date from API is a full ISO timestamp ("2026-02-27T00:00:00.000Z"), compare only date part
  const scheduleForDate = schedules.find((s) => s.date.slice(0, 10) === selectedDateStr) ?? null;

  const createMutation = useMutation({
    mutationFn: (data: CreateScheduleInput) => api.schedule.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateScheduleInput> }) =>
      api.schedule.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.schedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });

  const handleSave = (data: { startTime: string; endTime: string; breakStart?: string; breakEnd?: string }) => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    if (scheduleForDate) {
      updateMutation.mutate({ id: scheduleForDate.id, data });
    } else {
      createMutation.mutate({ date: dateStr, ...data });
    }
  };

  const handleDelete = () => {
    if (scheduleForDate) {
      deleteMutation.mutate(scheduleForDate.id);
      setSelectedDate(undefined);
    }
  };

  if (!currentUser) return <LoadingSpinner />;
  const masterData = currentUser.master;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        user={{
          fullName: masterData?.fullName,
          email: currentUser.email,
          avatar: masterData?.avatarUrl,
        }}
      />
      <main className={cn('p-8 transition-all duration-300 ease-in-out', 'ml-20 md:ml-20 lg:ml-64')}>
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Расписание</h1>
          <p className="text-muted-foreground">
            Настраивайте рабочий график и управляйте доступным временем
          </p>
        </div>
        <div className="flex gap-6 items-start flex-col lg:flex-row">
          <ScheduleCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            schedules={schedules}
          />
          <div className="flex-1 w-full">
            {!selectedDate ? (
              <ScheduleDateNotSelected />
            ) : (
              <ScheduleEditor
                selectedDate={selectedDate}
                existingSchedule={scheduleForDate}
                onSave={handleSave}
                onDelete={handleDelete}
                isSaving={createMutation.isPending || updateMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
