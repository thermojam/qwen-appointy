'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { SearchMastersParams, WorkFormat, MasterProfile } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { SearchBar } from '@/shared/ui/search-bar';
import { Badge } from '@/shared/ui/badge';
import { MasterCard } from '@/shared/ui/master-card';
import { Card, CardContent } from '@/shared/ui/card';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Clock, Filter, SlidersHorizontal, ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

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

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['masters', filters],
    queryFn: () => api.search.masters(filters),
    enabled: true, // Всегда загружать при монтировании
    staleTime: 1000 * 60, // 1 минута
  });

  // Логирование для отладки
  console.log('[Search] Data:', data);
  console.log('[Search] Error:', error);
  console.log('[Search] Filters:', filters);

  const handleSearch = (query: string) => {
    setFilters({ ...filters, query, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      workFormat: undefined,
      minRating: undefined,
      maxPrice: undefined,
      sortBy: 'rating',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
    });
  };

  const activeFiltersCount = [
    filters.workFormat,
    filters.minRating,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Поиск мастеров</h1>
              <p className="text-sm text-muted-foreground">
                Найдите лучшего мастера для себя
              </p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <SearchBar
              placeholder="Поиск по имени или описанию..."
              value={filters.query || ''}
              onChange={(e) =>
                setFilters({ ...filters, query: e.target.value, page: 1 })
              }
              onSearch={handleSearch}
            />
          </div>

          {/* Filters Bar */}
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <Select
              value={filters.sortBy || 'rating'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as SearchMastersParams['sortBy'],
                  page: 1,
                })
              }
              className="w-auto"
            >
              <option value="rating">По рейтингу</option>
              <option value="reviews">По отзывам</option>
              <option value="price">По цене</option>
            </Select>

            <Select
              value={filters.sortOrder || 'desc'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortOrder: e.target.value as 'asc' | 'desc',
                  page: 1,
                })
              }
              className="w-auto"
            >
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </Select>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground"
              >
                Сбросить
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b bg-surface/50">
          <div className="container mx-auto px-4 py-4">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Work Format */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Формат работы
                </label>
                <Select
                  value={filters.workFormat || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      workFormat: e.target.value as WorkFormat || undefined,
                      page: 1,
                    })
                  }
                >
                  <option value="">Все форматы</option>
                  <option value="ONLINE">Онлайн</option>
                  <option value="OFFLINE">Офлайн</option>
                  <option value="BOTH">Оба</option>
                </Select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Мин. рейтинг
                </label>
                <Select
                  value={filters.minRating?.toString() || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minRating: e.target.value ? Number(e.target.value) : undefined,
                      page: 1,
                    })
                  }
                >
                  <option value="">Любой</option>
                  <option value="4.5">4.5+</option>
                  <option value="4">4+</option>
                  <option value="3">3+</option>
                </Select>
              </div>

              {/* Max Price */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Макс. цена
                </label>
                <Select
                  value={filters.maxPrice?.toString() || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      maxPrice: e.target.value ? Number(e.target.value) : undefined,
                      page: 1,
                    })
                  }
                >
                  <option value="">Любая</option>
                  <option value="1000">до 1000 ₽</option>
                  <option value="3000">до 3000 ₽</option>
                  <option value="5000">до 5000 ₽</option>
                  <option value="10000">до 10000 ₽</option>
                </Select>
              </div>

              {/* Experience */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Опыт работы
                </label>
                <Select
                  onChange={(e) => {
                    const value = e.target.value;
                    // Handle experience filter if needed
                  }}
                >
                  <option value="">Любой</option>
                  <option value="1">1+ лет</option>
                  <option value="3">3+ лет</option>
                  <option value="5">5+ лет</option>
                  <option value="10">10+ лет</option>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Results Info */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Загрузка мастеров...</p>
            </div>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="mb-6 text-sm text-muted-foreground">
              Найдено мастеров: <span className="font-medium text-foreground">{data.pagination.total}</span>
            </div>

            {/* Masters Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((master: MasterProfile) => (
                <MasterCard
                  key={master.id}
                  id={master.id}
                  fullName={master.fullName}
                  avatarUrl={master.avatarUrl}
                  description={master.description}
                  workFormat={master.workFormat}
                  address={master.address}
                  rating={master.rating}
                  totalReviews={master.totalReviews}
                  experienceYears={master.experienceYears}
                  services={master.services}
                  onClick={() => router.push(`/masters/${master.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters({ ...filters, page: (filters.page || 1) - 1 })
                  }
                >
                  Назад
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    Страница {filters.page} из {data.pagination.totalPages}
                  </span>
                </div>
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
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-1">
                    Мастера не найдены
                  </h3>
                  <p className="text-muted-foreground">
                    Попробуйте изменить параметры поиска или сбросить фильтры
                  </p>
                </div>
                <Button onClick={handleClearFilters} variant="outline">
                  Сбросить фильтры
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
