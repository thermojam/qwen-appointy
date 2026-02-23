'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Star, MapPin, Clock, Calendar, ChevronLeft, Briefcase } from 'lucide-react';
import { useState } from 'react';

export default function MasterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const masterId = params.id as string;

  const [selectedService, setSelectedService] = useState<string | null>(null);

  const { data: master, isLoading } = useQuery({
    queryKey: ['master', masterId],
    queryFn: () => api.search.masterById(masterId),
    enabled: !!masterId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="font-heading font-semibold text-lg mb-2">
              Мастер не найден
            </h2>
            <Button onClick={() => router.push('/search')} variant="outline">
              Вернуться к поиску
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatWorkFormat = (format: string) => {
    switch (format) {
      case 'ONLINE':
        return 'Онлайн';
      case 'OFFLINE':
        return 'Офлайн';
      case 'BOTH':
        return 'Онлайн и офлайн';
      default:
        return format;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/search')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Поиск
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
        {/* Master Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar
                src={master.avatarUrl}
                alt={master.fullName}
                fallback={master.fullName.charAt(0)}
                size="xl"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="font-heading text-3xl font-bold">
                      {master.fullName}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formatWorkFormat(master.workFormat)}</span>
                      </div>
                      {master.address && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{master.address}</span>
                        </div>
                      )}
                      {master.experienceYears > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{master.experienceYears} лет опыта</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-warning-background px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="font-bold text-lg">{master.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({master.totalReviews} отзывов)
                    </span>
                  </div>
                </div>

                {master.description && (
                  <p className="mt-4 text-muted-foreground">
                    {master.description}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant={master.isVerified ? 'success' : 'secondary'}>
                    {master.isVerified ? '✓ Проверен' : 'Мастер'}
                  </Badge>
                  <Badge variant="outline">
                    {master.services?.length || 0} услуг
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Услуги</CardTitle>
                <CardDescription>
                  Выберите услугу для записи
                </CardDescription>
              </CardHeader>
              <CardContent>
                {master.services && master.services.length > 0 ? (
                  <div className="space-y-3">
                    {master.services
                      .filter((s) => s.isActive)
                      .map((service) => (
                        <div
                          key={service.id}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedService === service.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedService(service.id)}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.duration} мин
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-heading font-bold text-lg">
                              {Number(service.price).toLocaleString('ru-RU')} ₽
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Услуги пока не добавлены
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Запись</CardTitle>
                <CardDescription>
                  Выберите услугу и запишитесь
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedService ? (
                  <div className="space-y-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Выбрано:</span>
                      <p className="font-medium mt-1">
                        {master.services?.find((s) => s.id === selectedService)?.name}
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => router.push(`/book/${master.id}/${selectedService}`)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Записаться
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Выберите услугу для продолжения
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
