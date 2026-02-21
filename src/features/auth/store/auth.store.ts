'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;

  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  restoreFromStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        // Синхронизируем с localStorage сразу
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-tokens', JSON.stringify({
            state: { accessToken, refreshToken },
            version: 0,
          }));
        }
      },

      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
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
