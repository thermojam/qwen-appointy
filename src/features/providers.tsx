'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { useRestoreAuth } from '@/features/auth/store/auth.store';
import { ThemeProvider } from '@/features/theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Компонент для восстановления auth состояния из localStorage
 */
function AuthRestore({ children }: { children: ReactNode }) {
  const restoreAuth = useRestoreAuth();
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    // Восстанавливаем токены из localStorage при загрузке
    restoreAuth();
    setIsRestored(true);
  }, [restoreAuth]);

  if (!isRestored) {
    return null; // Или лоадер, если нужно
  }

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthRestore>{children}</AuthRestore>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
