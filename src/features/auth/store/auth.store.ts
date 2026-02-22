'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  setTokens: (accessToken: string, refreshToken: string, user?: User) => void;
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

      setTokens: (accessToken, refreshToken, user) => {
        set({ accessToken, refreshToken, user: user || get().user });
        // Синхронизируем с localStorage и cookies
        if (typeof window !== 'undefined') {
          const state = { accessToken, refreshToken, user: user || get().user };
          localStorage.setItem('auth-tokens', JSON.stringify({ state, version: 0 }));
          // Сохраняем в cookies для middleware
          document.cookie = `auth-tokens=${encodeURIComponent(JSON.stringify({ state }))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      },

      setUser: (user) => {
        set({ user });
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('auth-tokens');
          const parsed = stored ? JSON.parse(stored) : { state: {} };
          const state = { ...parsed.state, user };
          localStorage.setItem('auth-tokens', JSON.stringify({ state, version: 0 }));
          document.cookie = `auth-tokens=${encodeURIComponent(JSON.stringify({ state }))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
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
          document.cookie = 'auth-tokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
      skipHydration: true,
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
