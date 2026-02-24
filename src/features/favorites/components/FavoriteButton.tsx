'use client';

import { Heart } from 'lucide-react';
import { useToggleFavorite, useIsFavorite } from '../api/favorites.api';
import { cn } from '@/shared/lib/utils';

interface FavoriteButtonProps {
  masterId: string;
  variant?: 'icon' | 'button';
  className?: string;
  onClick?: () => void;
}

/**
 * Кнопка «Избранное» с иконкой сердца
 * Поддерживает два варианта: icon (только иконка) и button (с текстом)
 */
export const FavoriteButton = ({ masterId, variant = 'icon', className, onClick }: FavoriteButtonProps) => {
  const { data: isFavoriteData } = useIsFavorite(masterId);
  const { mutate: toggleFavorite, isPending } = useToggleFavorite();
  const isFavorite = isFavoriteData?.isFavorite ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPending) {
      toggleFavorite({ masterId, isFavorite });
      onClick?.();
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          'p-2 rounded-full transition-colors hover:scale-110 active:scale-95',
          isFavorite
            ? 'text-red-500 bg-red-50 hover:bg-red-100'
            : 'text-gray-400 hover:text-red-500 hover:bg-gray-50',
          isPending && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        type="button"
      >
        <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    );
  }

  // Button variant
  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:scale-105 active:scale-95',
        isFavorite
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        isPending && 'opacity-50 cursor-not-allowed',
        className
      )}
      type="button"
    >
      <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
      {isFavorite ? 'В избранном' : 'В избранное'}
    </button>
  );
};
