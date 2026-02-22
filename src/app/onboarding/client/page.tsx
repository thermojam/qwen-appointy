'use client';

import { useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/features/onboarding/components/OnboardingWizard';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import { useEffect } from 'react';

export default function ClientOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/sign-in');
      } else if (user?.role !== 'CLIENT') {
        // Если мастер, редиректим на его онбординг
        router.push('/onboarding/master');
      } else if (user?.client) {
        // Если профиль уже заполнен, редиректим на главную
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <OnboardingWizard role="CLIENT" />;
}
