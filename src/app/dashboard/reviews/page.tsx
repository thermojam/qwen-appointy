'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { Sidebar } from '@/features/dashboard/ui/sidebar';
import { useCurrentUser, useLogout } from '@/features/auth/hooks/auth.hooks';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';
import {
  Star,
  Trash2,
  User,
  ThumbsUp,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const ratingFilters: Array<{ value: number | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Все' },
  { value: 5, label: '5 ★' },
  { value: 4, label: '4 ★' },
  { value: 3, label: '3 ★' },
  { value: 2, label: '2 ★' },
  { value: 1, label: '1 ★' },
];

export default function ReviewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState<number | 'ALL'>('ALL');
  
  const currentUserQuery = useCurrentUser();
  const logout = useLogout();
  const currentUser = currentUserQuery.data;

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', selectedRating],
    queryFn: () => {
      const filters = selectedRating !== 'ALL' 
        ? { minRating: selectedRating, maxRating: selectedRating }
        : undefined;
      return api.reviews.getAll(filters);
    },
    enabled: !!currentUser,
  });

  const { data: stats } = useQuery({
    queryKey: ['reviews-stats'],
    queryFn: () => api.reviews.getStats(),
    enabled: !!currentUser,
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => api.reviews.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-stats'] });
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

  const averageRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalReviews || 0;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
    );
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
          <h1 className="font-heading text-3xl font-bold mb-2">Отзывы</h1>
          <p className="text-muted-foreground">
            Отзывы ваших клиентов
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-600 fill-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Рейтинг</p>
                    <p className="font-heading text-3xl font-bold">
                      {averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего отзывов</p>
                    <p className="font-heading text-3xl font-bold">
                      {totalReviews}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">5 звёзд</p>
                    <p className="font-heading text-3xl font-bold">
                      {stats.ratingDistribution[5] || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && totalReviews > 0 && (
          <Card className="mb-8 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold mb-4">
                Распределение оценок
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto">
          <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          {ratingFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedRating === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRating(filter.value)}
              className="flex-shrink-0"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="card-hover rounded-3xl border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                      {review.client?.avatarUrl ? (
                        <img
                          src={review.client.avatarUrl}
                          alt={review.client?.fullName || 'Client'}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold mb-1">
                            {review.client?.fullName || 'Клиент'}
                          </h3>
                          <div className="mb-2">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      {review.comment ? (
                        <p className="text-muted-foreground">
                          {review.comment}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Без комментария
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReview.mutate(review.id)}
                      disabled={deleteReview.isPending}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ThumbsUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {selectedRating !== 'ALL'
                  ? `Нет отзывов с оценкой ${selectedRating} ★`
                  : 'Отзывов пока нет'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
