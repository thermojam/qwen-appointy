'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Service, Review, Schedule, PortfolioWork } from '@/shared/types/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { MapPin, Star, Clock, Calendar } from 'lucide-react';

export default function MasterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const masterId = params.id as string;

  const { data: master, isLoading } = useQuery({
    queryKey: ['master', masterId],
    queryFn: () => api.search.masterById(masterId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Мастер не найден</p>
            <Button className="mt-4" onClick={() => router.push('/search')}>
              К поиску
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/search')}>
            ← Назад к поиску
          </Button>
          <Button>Записаться</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-6">
                  {master.avatarUrl ? (
                    <img
                      src={master.avatarUrl}
                      alt={master.fullName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl text-primary font-bold">
                      {master.fullName[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="font-heading text-3xl font-bold mb-2">
                      {master.fullName}
                    </h1>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-warning text-warning" />
                        <span className="font-semibold text-lg">
                          {master.rating.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          ({master.totalReviews} отзывов)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {master.workFormat === 'ONLINE' && 'Онлайн'}
                        {master.workFormat === 'OFFLINE' && 'Офлайн'}
                        {master.workFormat === 'BOTH' && 'Онлайн и офлайн'}
                      </div>
                      {master.experienceYears > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {master.experienceYears} лет опыта
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {master.description && (
                  <div>
                    <h3 className="font-heading font-semibold mb-2">О мастере</h3>
                    <p className="text-muted-foreground">{master.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            {master.services && master.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Услуги</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {master.services.map((service: Service) => (
                      <div
                        key={service.id}
                        className="flex justify-between items-center py-3 border-b last:border-0"
                      >
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{service.price} ₽</p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration} мин
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {master.reviews && master.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Отзывы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {master.reviews && master.reviews.map((review: Review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                            {review.client?.fullName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {review.client?.fullName || 'Аноним'}
                            </p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'fill-warning text-warning'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            {master.schedule && master.schedule.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    График работы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {master.schedule && master.schedule.map((slot: Schedule) => (
                      <div key={slot.id} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {slot.dayOfWeek.toLowerCase().replace('_', ' ')}
                        </span>
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {master.portfolio && master.portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Портфолио</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {master.portfolio && master.portfolio.slice(0, 4).map((work: PortfolioWork) => (
                      <img
                        key={work.id}
                        src={work.imageUrl}
                        alt={work.title || 'Portfolio work'}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking CTA */}
            <Card>
              <CardHeader>
                <CardTitle>Записаться</CardTitle>
                <CardDescription>
                  Выберите услугу и удобное время
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Выбрать время
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {master.bookingConfirmationRequired
                    ? 'Запись требует подтверждения'
                    : 'Мгновенное подтверждение'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
