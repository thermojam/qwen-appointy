'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { useCurrentUser } from '@/features/auth/hooks/auth.hooks';
import { StepIndicator } from './StepIndicator';
import { useOnboardingStore } from '../hooks/useOnboardingStore';

// Master steps
import { MasterStep1 } from './MasterOnboarding/Step1BasicInfo';
import { MasterStep2 } from './MasterOnboarding/Step2WorkFormat';
import { MasterStep3 } from './MasterOnboarding/Step3Description';
import { MasterStep4 } from './MasterOnboarding/Step4BookingRules';
import { MasterStep5 } from './MasterOnboarding/Step5Schedule';
import { MasterStep6 } from './MasterOnboarding/Step6Review';

// Client steps
import { ClientStep1 } from './ClientOnboarding/Step1BasicInfo';
import { ClientStep2 } from './ClientOnboarding/Step2Interests';
import { ClientStep3 } from './ClientOnboarding/Step3Review';

const MASTER_STEP_LABELS = [
  'Информация',
  'Формат работы',
  'Услуги',
  'Правила',
  'График',
  'Проверка',
];

const CLIENT_STEP_LABELS = [
  'Информация',
  'Интересы',
  'Проверка',
];

export function OnboardingWizard() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { currentStep, setCurrentStep, master, client, updateMasterData, updateClientData, resetOnboarding } =
    useOnboardingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Определяем роль из пользователя
  const isMaster = user?.role === 'MASTER';
  const totalSteps = isMaster ? 6 : 3;

  // Master mutation
  const completeMaster = useMutation({
    mutationFn: async () => {
      return api.onboarding.completeMaster({
        fullName: master.fullName,
        avatarUrl: master.avatarUrl || undefined,
        description: master.description || undefined,
        workFormat: master.workFormat,
        address: master.address || undefined,
        experienceYears: master.experienceYears,
        bookingConfirmationRequired: master.bookingConfirmationRequired,
        minCancellationTime: master.minCancellationTime,
        maxBookingLeadTime: master.maxBookingLeadTime,
      });
    },
    onSuccess: () => {
      resetOnboarding();
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Master onboarding error:', error);
      setIsSubmitting(false);
    },
  });

  // Client mutation
  const completeClient = useMutation({
    mutationFn: async () => {
      // Не отправляем avatarUrl, если он пустой или содержит base64 (для MVP)
      const { avatarUrl, ...rest } = client;
      return api.onboarding.completeClient({
        fullName: rest.fullName,
        interests: rest.interests,
      });
    },
    onSuccess: () => {
      resetOnboarding();
      router.push('/');
    },
    onError: (error) => {
      console.error('Client onboarding error:', error);
      setIsSubmitting(false);
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (isMaster) {
      await completeMaster.mutateAsync();
    } else {
      await completeClient.mutateAsync();
    }
  };

  // Render current step
  const renderStep = useMemo(() => {
    if (isMaster) {
      switch (currentStep) {
        case 0:
          return <MasterStep1 onNext={handleNext} />;
        case 1:
          return <MasterStep2 onNext={handleNext} onBack={handleBack} />;
        case 2:
          return <MasterStep3 onNext={handleNext} onBack={handleBack} />;
        case 3:
          return <MasterStep4 onNext={handleNext} onBack={handleBack} />;
        case 4:
          return <MasterStep5 onNext={handleNext} onBack={handleBack} />;
        case 5:
          return <MasterStep6 onSubmit={handleSubmit} onBack={handleBack} />;
        default:
          return null;
      }
    } else {
      switch (currentStep) {
        case 0:
          return <ClientStep1 onNext={handleNext} />;
        case 1:
          return <ClientStep2 onNext={handleNext} onBack={handleBack} />;
        case 2:
          return <ClientStep3 onSubmit={handleSubmit} onBack={handleBack} />;
        default:
          return null;
      }
    }
  }, [currentStep, isMaster, master, client]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold mb-2">
            {isMaster ? 'Регистрация мастера' : 'Регистрация клиента'}
          </h1>
          <p className="text-muted-foreground">
            {isMaster
              ? 'Заполните профиль для начала работы на платформе'
              : 'Найдите мастеров по вашим интересам'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <StepIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepLabels={isMaster ? MASTER_STEP_LABELS : CLIENT_STEP_LABELS}
          />
        </div>

        {/* Step content */}
        <div className="bg-card rounded-xl shadow-lg p-6">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Сохранение данных...</p>
            </div>
          ) : (
            renderStep
          )}
        </div>

        {/* Footer help */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Нужна помощь?{' '}
            <a href="#" className="text-primary hover:underline">
              Связаться с поддержкой
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
