import { z } from 'zod';
import { WorkFormat, DayOfWeek, OfflineMode } from '@prisma/client';

// Шаг 1: Базовая информация
export const masterStep1Schema = z.object({
  fullName: z.string().min(2, 'ФИО должно содержать минимум 2 символа'),
  avatarUrl: z.string().url('Некорректный URL').optional().or(z.literal('')),
  experienceYears: z.number().int().min(0).max(50),
});

// Шаг 2: Формат работы и локация
export const masterStep2Schema = z.object({
  workFormat: z.nativeEnum(WorkFormat),
  offlineMode: z.nativeEnum(OfflineMode).optional(),
  address: z.string().min(5, 'Укажите адрес').optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).refine((data) => {
  // Для OFFLINE с режимом AT_MY_PLACE требуется адрес
  if (data.workFormat === 'OFFLINE' && data.offlineMode === 'AT_MY_PLACE') {
    return !!data.address;
  }
  // Для OFFLINE с режимом AT_CLIENT_PLACE адрес не требуется
  if (data.workFormat === 'OFFLINE' && data.offlineMode === 'AT_CLIENT_PLACE') {
    return true;
  }
  // Для BOTH требуется адрес
  if (data.workFormat === 'BOTH') {
    return !!data.address;
  }
  // Для ONLINE адрес не требуется
  return true;
}, {
  message: 'Укажите адрес для работы на своём месте',
  path: ['address'],
});

// Шаг 3: Описание и услуги
export const masterStep3Schema = z.object({
  description: z.string().max(1000, 'Описание не более 1000 символов').optional().or(z.literal('')),
  serviceIds: z.array(z.string()).min(1, 'Выберите хотя бы одну услугу'),
});

// Шаг 4: Правила бронирования
export const masterStep4Schema = z.object({
  bookingConfirmationRequired: z.boolean(),
  minCancellationTime: z.number().int().min(1).max(168),
  maxBookingLeadTime: z.number().int().min(1).max(365),
});

// Шаг 5: График работы
export const scheduleDaySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Некорректное время'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Некорректное время'),
  breakStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Некорректное время').optional().or(z.literal('')),
  breakEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Некорректное время').optional().or(z.literal('')),
  isActive: z.boolean(),
}).refine((data) => {
  if (!data.isActive) return true;
  return data.startTime < data.endTime;
}, {
  message: 'Время начала должно быть раньше времени окончания',
  path: ['startTime'],
});

export const masterStep5Schema = z.object({
  schedule: z.array(scheduleDaySchema),
});

// Шаг 6: Финал (только подтверждение)
export const masterStep6Schema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, 'Необходимо согласиться с условиями'),
});

// Полная схема для мастера
export const completeMasterOnboardingSchema = z.object({
  ...masterStep1Schema.shape,
  ...masterStep2Schema.shape,
  ...masterStep3Schema.shape,
  ...masterStep4Schema.shape,
  ...masterStep5Schema.shape,
  ...masterStep6Schema.shape,
});
