import { z } from 'zod';

// Шаг 1: Базовая информация
export const clientStep1Schema = z.object({
  fullName: z.string().min(2, 'ФИО должно содержать минимум 2 символа'),
  avatarUrl: z.string().url('Некорректный URL').optional().or(z.literal('')),
});

// Шаг 2: Интересы
export const clientStep2Schema = z.object({
  interests: z.array(z.string()).min(1, 'Выберите хотя бы один интерес'),
});

// Шаг 3: Финал (только подтверждение)
export const clientStep3Schema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, 'Необходимо согласиться с условиями'),
});

// Полная схема для клиента
export const completeClientOnboardingSchema = z.object({
  ...clientStep1Schema.shape,
  ...clientStep2Schema.shape,
  ...clientStep3Schema.shape,
});
