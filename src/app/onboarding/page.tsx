'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import type { User } from '@/shared/types/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Редирект на правильный онбординг по роли
  useEffect(() => {
    if (!isLoading && user) {
      const typedUser = user as User;
      
      // Проверяем, был ли уже пройден онбординг
      const hasProfile = typedUser.role === 'MASTER' ? typedUser.master : typedUser.client;

      if (hasProfile) {
        // Профиль уже заполнен - редирект в дашборд
        if (typedUser.role === 'MASTER') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else {
        // Профиль не заполнен - редирект на онбординг по роли
        const role = typedUser.role.toLowerCase();
        router.push(`/onboarding/${role}`);
      }
    }
  }, [user, isLoading, router]);

  // Показываем лоадер во время проверки авторизации
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Если не авторизован - показываем кнопку входа
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center mb-4">Требуется авторизация</p>
            <Button className="w-full" onClick={() => router.push('/sign-in')}>
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Показываем лоадер во время редиректа
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
