import {z} from 'zod';
import {UserRole, WorkFormat, DayOfWeek} from '@prisma/client';

// ====================================================
// AUTH SCHEMAS
// ====================================================

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.nativeEnum(UserRole).default(UserRole.CLIENT),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ====================================================
// ONBOARDING SCHEMAS
// ====================================================

export const masterOnboardingSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    description: z.string().max(1000).optional().or(z.literal('')),
    workFormat: z.nativeEnum(WorkFormat).default(WorkFormat.BOTH),
    address: z.string().optional().or(z.literal('')),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    experienceYears: z.number().int().min(0).default(0),
    bookingConfirmationRequired: z.boolean().default(true),
    minCancellationTime: z.number().int().min(1).default(24),
    maxBookingLeadTime: z.number().int().min(1).default(30),
});

export const clientOnboardingSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    interests: z.array(z.string()).default([]),
});

// ====================================================
// SERVICE SCHEMAS
// ====================================================

export const createServiceSchema = z.object({
    name: z.string().min(2, 'Service name is required'),
    description: z.string().max(1000).optional().or(z.literal('')),
    duration: z.number().int().positive('Duration must be positive'),
    price: z.number().positive('Price must be positive'),
});

export const updateServiceSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().max(1000).optional().or(z.literal('')),
    duration: z.number().int().positive().optional(),
    price: z.number().positive().optional(),
    isActive: z.boolean().optional(),
});

// ====================================================
// SCHEDULE SCHEMAS
// ====================================================

const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)');

export const createScheduleSchema = z.object({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    startTime: timeSchema,
    endTime: timeSchema,
    breakStart: timeSchema.optional().or(z.literal('')),
    breakEnd: timeSchema.optional().or(z.literal('')),
    isActive: z.boolean().default(true),
});

// ====================================================
// APPOINTMENT SCHEMAS
// ====================================================

export const createAppointmentSchema = z.object({
    masterId: z.string().uuid('Invalid master ID'),
    serviceId: z.string().uuid('Invalid service ID'),
    dateTime: z.string().transform((val) => new Date(val)),
    comment: z.string().max(500).optional().or(z.literal('')),
});

export const updateAppointmentStatusSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
});

// ====================================================
// REVIEW SCHEMAS
// ====================================================

export const createReviewSchema = z.object({
    masterId: z.string().uuid('Invalid master ID'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional().or(z.literal('')),
});

// ====================================================
// SEARCH SCHEMAS
// ====================================================

export const searchMastersSchema = z.object({
    query: z.string().optional(),
    workFormat: z.nativeEnum(WorkFormat).optional(),
    minRating: z.number().min(0).max(5).optional(),
    maxPrice: z.number().positive().optional(),
    serviceId: z.string().uuid().optional(),
    sortBy: z.enum(['rating', 'price', 'distance', 'reviews']).default('rating'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(20),
});
