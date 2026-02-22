'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { BookingWizard } from '@/shared/ui/booking-wizard';
import { Button } from '@/shared/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const masterId = params.masterId as string;
  const serviceId = params.serviceId as string;

  // Fetch master details
  const { data: master, isLoading } = useQuery({
    queryKey: ['master', masterId],
    queryFn: () => api.search.masterById(masterId),
    enabled: !!masterId,
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
          <Button
            variant="ghost"
            onClick={() => router.push(`/masters/${masterId}`)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад к профилю
          </Button>
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
            onSubmit={(data) => {
              // Handle successful booking
              console.log('Booking created:', data);
              // Redirect to appointments or show success message
              router.push('/appointments');
            }}
          />
        </div>
      </main>
    </div>
  );
}
