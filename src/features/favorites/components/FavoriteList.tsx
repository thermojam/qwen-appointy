'use client';

import { useRouter } from 'next/navigation';
import { useFavorites } from '../api/favorites.api';
import { FavoriteCard } from './FavoriteCard';
import { EmptyFavorites } from './EmptyFavorites';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Список избранных мастеров с пагинацией
 */
export const FavoriteList = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: masters, isLoading, error } = useFavorites({ page, limit });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-destructive">Ошибка загрузки избранных мастеров</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!masters || masters.length === 0) {
    return <EmptyFavorites />;
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-2xl">
          Избранные мастера
        </h2>
        <p className="text-sm text-muted-foreground">
          {masters.length} мастеров
        </p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {masters.map((master) => (
          <FavoriteCard
            key={master.id}
            master={master}
            onClick={() => router.push(`/masters/${master.id}`)}
          />
        ))}
      </div>

      {/* Pagination */}
      {masters.length === limit && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Назад
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm text-muted-foreground">
              Страница {page}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  );
};
