'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearTokens: () => void;
  restoreFromStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        // Синхронизируем с localStorage сразу
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-tokens', JSON.stringify({
            state: { accessToken, refreshToken, user: get().user },
            version: 0,
          }));
        }
      },

      setUser: (user) => {
        set({ user });
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('auth-tokens');
          const parsed = stored ? JSON.parse(stored) : { state: {} };
          localStorage.setItem('auth-tokens', JSON.stringify({
            state: { ...parsed.state, user },
            version: 0,
          }));
        }
      },

      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-tokens');
        }
      },

      restoreFromStorage: () => {
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('auth-tokens');
            if (stored) {
              const parsed = JSON.parse(stored);
              set({
                accessToken: parsed.state?.accessToken || null,
                refreshToken: parsed.state?.refreshToken || null,
                user: parsed.state?.user || null,
              });
            }
          } catch (error) {
            console.error('Failed to restore auth from storage:', error);
          }
        }
      },
    }),
    {
      name: 'auth-tokens',
      skipHydration: true, // Отключаем автоматическую гидратацию
    }
  )
);

// Хук для восстановления сессии при загрузке приложения
export function useRestoreAuth() {
  const restore = useAuthStore((state) => state.restoreFromStorage);
  return restore;
}

// Helper hooks
export const useAuth = () => useAuthStore((state) => ({
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
}));
