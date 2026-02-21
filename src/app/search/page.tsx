'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { SearchMastersParams, WorkFormat, MasterProfile } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Select } from '@/shared/ui/select';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Clock } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchMastersParams>({
    query: '',
    workFormat: undefined,
    minRating: undefined,
    maxPrice: undefined,
    sortBy: 'rating',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['masters', filters],
    queryFn: () => api.search.masters(filters),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically refetch due to queryKey change
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Поиск мастеров</h1>
            <p className="text-sm text-muted-foreground">
              Найдите лучшего мастера для себя
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Назад
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Поиск по имени или описанию..."
                    value={filters.query || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, query: e.target.value })
                    }
                  />
                </div>
                <Select
                  value={filters.workFormat || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      workFormat: e.target.value as WorkFormat || undefined,
                    })
                  }
                >
                  <option value="">Все форматы</option>
                  <option value="ONLINE">Онлайн</option>
                  <option value="OFFLINE">Офлайн</option>
                  <option value="BOTH">Оба</option>
                </Select>
                <Select
                  value={filters.sortBy || 'rating'}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      sortBy: e.target.value as SearchMastersParams['sortBy'],
                    })
                  }
                >
                  <option value="rating">По рейтингу</option>
                  <option value="reviews">По отзывам</option>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <p className="text-center text-muted-foreground">Загрузка...</p>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Найдено мастеров: {data.pagination.total}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((master: MasterProfile) => (
                <Card
                  key={master.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/masters/${master.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {master.avatarUrl ? (
                        <img
                          src={master.avatarUrl}
                          alt={master.fullName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {master.fullName[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg">{master.fullName}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {master.workFormat === 'ONLINE' && 'Онлайн'}
                          {master.workFormat === 'OFFLINE' && 'Офлайн'}
                          {master.workFormat === 'BOTH' && 'Онлайн и офлайн'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {master.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {master.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-semibold">{master.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({master.totalReviews} отзывов)
                        </span>
                      </div>
                      {master.services && master.services.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          от {Math.min(...master.services.map((s) => Number(s.price)))} ₽
                        </div>
                      )}
                    </div>
                    {master.services && master.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {master.services.slice(0, 3).map((service) => (
                          <span
                            key={service.id}
                            className="text-xs bg-secondary px-2 py-1 rounded"
                          >
                            {service.name}
                          </span>
                        ))}
                        {master.services.length > 3 && (
                          <span className="text-xs bg-secondary px-2 py-1 rounded">
                            +{master.services.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters({ ...filters, page: (filters.page || 1) - 1 })
                  }
                >
                  Назад
                </Button>
                <span className="flex items-center px-4">
                  Страница {filters.page} из {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={filters.page === data.pagination.totalPages}
                  onClick={() =>
                    setFilters({ ...filters, page: (filters.page || 1) + 1 })
                  }
                >
                  Вперед
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Мастера не найдены. Попробуйте изменить параметры поиска.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
