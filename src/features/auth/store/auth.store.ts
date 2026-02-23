'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/types/api';

const STORAGE_VERSION = 'v1';
const STORAGE_KEY = `auth-tokens:${STORAGE_VERSION}`;

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  setTokens: (accessToken: string, refreshToken: string, user?: User) => void;
  setUser: (user: User) => void;
  clearTokens: () => void;
  restoreFromStorage: () => void;
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // localStorage недоступен (incognito, disabled, quota exceeded)
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Игнорируем ошибки записи
  }
}

function safeRemoveItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Игнорируем ошибки удаления
  }
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
          safeSetItem(STORAGE_KEY, JSON.stringify({ state, version: STORAGE_VERSION }));
          // Сохраняем в cookies для middleware
          document.cookie = `auth-tokens=${encodeURIComponent(JSON.stringify({ state }))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      },

      setUser: (user) => {
        set({ user });
        if (typeof window !== 'undefined') {
          const stored = safeGetItem(STORAGE_KEY);
          const parsed = stored ? JSON.parse(stored) : { state: {} };
          const state = { ...parsed.state, user };
          safeSetItem(STORAGE_KEY, JSON.stringify({ state, version: STORAGE_VERSION }));
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
          safeRemoveItem(STORAGE_KEY);
          document.cookie = 'auth-tokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },

      restoreFromStorage: () => {
        if (typeof window !== 'undefined') {
          try {
            const stored = safeGetItem(STORAGE_KEY);
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
