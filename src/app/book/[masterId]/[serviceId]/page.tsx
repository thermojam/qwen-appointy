'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { BookingWizard } from '@/shared/ui/booking-wizard';
import { Button } from '@/shared/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const masterId = params.masterId as string;
  const serviceId = params.serviceId as string;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch master details
  const { data: master, isLoading } = useQuery({
    queryKey: ['master', masterId],
    queryFn: () => api.search.masterById(masterId),
    enabled: !!masterId,
  });

  // Fetch available slots when date is selected
  const { data: availableSlots, refetch: refetchSlots } = useQuery({
    queryKey: ['slots', masterId, serviceId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const service = master?.services?.find(s => s.id === serviceId);
      if (!service) return [];
      console.log('[BookPage] Fetching slots for:', { masterId, date: selectedDate, duration: service.duration });
      const slots = await api.schedule.getAvailableSlots(masterId, selectedDate, service.duration);
      console.log('[BookPage] Available slots:', slots);
      return slots;
    },
    enabled: !!selectedDate, // Trigger when date is selected
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Мастер не найден</h1>
          <Button onClick={() => router.push('/search')}>
            Вернуться к поиску
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push(`/masters/${masterId}`)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/client')}
              size="sm"
            >
              В дашборд
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-3xl font-bold mb-2">
              Запись к мастеру
            </h1>
            <p className="text-muted-foreground">
              {master.fullName}
            </p>
          </div>

          <BookingWizard
            masterId={masterId}
            masterName={master.fullName}
            services={master.services || []}
            availableSlots={availableSlots || []}
            onDateSelect={(date) => {
              const dateStr = date.toISOString().split('T')[0];
              setSelectedDate(dateStr);
            }}
            onSubmit={async (data) => {
              console.log('[BookPage] Creating appointment:', data);
              try {
                await api.appointments.createAppointment(data);
                console.log('[BookPage] Appointment created successfully');
                
                // Инвалидируем кэши для обновления данных в реальном времени
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard-upcoming'] });
                queryClient.invalidateQueries({ queryKey: ['client-appointments'] });
                
                router.push('/client');
              } catch (error) {
                console.error('[BookPage] Failed to create appointment:', error);
                alert('Не удалось создать запись. Попробуйте снова.');
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
