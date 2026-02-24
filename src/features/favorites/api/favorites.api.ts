import { api } from '@/shared/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MasterProfile } from '@/shared/types/api';

interface ToggleFavoriteParams {
  masterId: string;
  isFavorite: boolean;
}

interface ToggleFavoriteResult {
  added: boolean;
}

/**
 * Hook для получения списка избранных мастеров
 */
export const useFavorites = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: ['favorites', params],
    queryFn: async () => {
      const response = await api.favorites.getAll(params);
      // response — это { data: Master[], pagination: {...} }
      return response.data;
    },
  });

/**
 * Hook для добавления/удаления из избранного
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ masterId, isFavorite }: ToggleFavoriteParams): Promise<ToggleFavoriteResult> => {
      if (isFavorite) {
        await api.favorites.remove(masterId);
        return { added: false };
      } else {
        await api.favorites.add(masterId);
        return { added: true };
      }
    },
    onSuccess: (_, { masterId }) => {
      // Инвалидируем ВСЕ кэши избранных (для дашборда и для отдельных страниц)
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites', { page: 1, limit: 10 }] });
      // Инвалидируем конкретный check для этого мастера
      if (masterId) {
        queryClient.invalidateQueries({ queryKey: ['isFavorite', masterId] });
      }
    },
  });
};

/**
 * Hook для проверки, в избранном ли мастер
 */
export const useIsFavorite = (masterId: string | null) =>
  useQuery({
    queryKey: ['isFavorite', masterId],
    queryFn: () => api.favorites.check(masterId!),
    enabled: !!masterId,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: false,
  });
