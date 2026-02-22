'use client';

import { useRouter } from 'next/navigation';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { RegisterInput, LoginInput, User } from '@/shared/types/api';

const AUTH_KEYS = {
  all: ['auth'] as const,
  user: ['auth', 'user'] as const,
};

/**
 * Хук для получения текущего пользователя
 * Автоматически кэшируется и обновляется
 */
export function useCurrentUser() {
  const { setTokens, clearTokens } = useAuthStore();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: async (): Promise<User> => {
      try {
        return await api.auth.me();
      } catch (error: any) {
        // При ошибке 401 очищаем токены
        if (error?.status === 401) {
          clearTokens();
          queryClient.setQueryData(AUTH_KEYS.user, null);
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Хук для проверки авторизации
 * Возвращает данные пользователя и статус загрузки
 */
export function useAuth() {
  const { data: user, isLoading, error, isSuccess } = useCurrentUser();
  const { accessToken } = useAuthStore();

  return {
    user: isSuccess ? user : null,
    isLoading,
    isAuthenticated: !!user && !!accessToken && isSuccess,
    error,
  };
}

/**
 * Регистрация пользователя
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const { setTokens } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      return api.auth.register(data);
    },
    onSuccess: (tokens) => {
      // Сохраняем токены
      setTokens(tokens.accessToken, tokens.refreshToken);

      // Инвалидируем кэш пользователя и сразу загружаем его
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all });
      queryClient.fetchQuery({
        queryKey: AUTH_KEYS.user,
        queryFn: () => api.auth.me(),
      }).then((user) => {
        // Сохраняем user и редиректим на правильный онбординг
        setTokens(tokens.accessToken, tokens.refreshToken, user);
        const role = user.role.toLowerCase();
        router.push(`/onboarding/${role}`);
      });
    },
  });
}

/**
 * Вход пользователя
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { setTokens } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      return api.auth.login(data);
    },
    onSuccess: (tokens) => {
      // Сохраняем токены
      setTokens(tokens.accessToken, tokens.refreshToken);

      // Загружаем данные пользователя
      queryClient
        .fetchQuery({
          queryKey: AUTH_KEYS.user,
          queryFn: () => api.auth.me(),
        })
        .then((user) => {
          // Сохраняем user с токенами
          setTokens(tokens.accessToken, tokens.refreshToken, user);
          
          // Определяем редирект по наличию профиля
          const hasProfile = user.role === 'MASTER' ? user.master : user.client;

          if (!hasProfile) {
            const role = user.role.toLowerCase();
            router.push(`/onboarding/${role}`);
          } else if (user.role === 'MASTER') {
            router.push('/dashboard');
          } else {
            // CLIENT role
            router.push('/');
          }
        })
        .catch(() => {
          // Ошибка получения пользователя - всё равно на онбординг
          router.push('/onboarding');
        });
    },
  });
}

/**
 * Выход пользователя
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { clearTokens } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.auth.logout();
      } catch {
        // Игнорируем ошибки logout
      }
    },
    onSuccess: () => {
      // Очищаем токены
      clearTokens();

      // Сбрасываем кэш пользователя
      queryClient.setQueryData(AUTH_KEYS.user, null);
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all });

      // Редирект на страницу входа
      router.push('/sign-in');
    },
  });
}

/**
 * Обновление токена
 */
export function useRefreshToken() {
  const { setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async (refreshToken: string) => {
      return api.auth.refresh(refreshToken);
    },
    onSuccess: (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
    },
  });
}
