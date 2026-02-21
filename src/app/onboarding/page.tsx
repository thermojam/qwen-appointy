'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import type { User } from '@/shared/types/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  // Проверяем, был ли уже пройден онбординг
  useEffect(() => {
    if (!user) return;

    const typedUser = user as User;
    const hasProfile = typedUser.role === 'MASTER' ? typedUser.master : typedUser.client;

    if (hasProfile) {
      // Профиль уже заполнен - редирект
      if (typedUser.role === 'MASTER') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

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
            <Button className="w-full" onClick={() => router.push('/auth/login')}>
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <OnboardingWizard />;
}
