'use client';

import React, { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

function ThemeInitializer() {
  const { setTheme } = useTheme();
  
  useEffect(() => {
    // Сбрасываем тему на light при первом запуске
    const storedTheme = localStorage.getItem('theme');
    if (!storedTheme) {
      setTheme('light');
    }
  }, [setTheme]);
  
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeInitializer />
      {children}
    </NextThemesProvider>
  );
}
