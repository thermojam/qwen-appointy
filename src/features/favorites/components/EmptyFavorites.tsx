'use client';

import { Heart, Search } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';

/**
 * Компонент пустого состояния для страницы избранных
 */
export const EmptyFavorites = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <Heart className="h-10 w-10 text-red-300" />
      </div>
      
      <h3 className="font-heading font-semibold text-xl mb-2 text-center">
        Список избранного пуст
      </h3>
      
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Добавьте мастеров в избранное, чтобы быстро находить их позже
      </p>
      
      <Button
        onClick={() => router.push('/search')}
        className="gap-2"
      >
        <Search className="w-4 h-4" />
        Найти мастеров
      </Button>
    </div>
  );
};
