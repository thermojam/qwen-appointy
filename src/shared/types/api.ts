// API response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// User & Auth
export type UserRole = 'MASTER' | 'CLIENT' | 'ADMIN';
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  master?: MasterProfile | null;
  client?: ClientProfile | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Master
export type WorkFormat = 'ONLINE' | 'OFFLINE' | 'BOTH';

export interface MasterProfile {
  id: string;
  userId: string;
  avatarUrl?: string | null;
  fullName: string;
  description?: string | null;
  workFormat: WorkFormat;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  experienceYears: number;
  rating: number;
  totalReviews: number;
  bookingConfirmationRequired: boolean;
  minCancellationTime: number;
  maxBookingLeadTime: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  services?: Service[];
  schedule?: Schedule[];
  portfolio?: PortfolioWork[];
  reviews?: Review[];
}

export interface MasterOnboardingInput {
  fullName: string;
  avatarUrl?: string;
  description?: string;
  workFormat: WorkFormat;
  address?: string;
  latitude?: number;
  longitude?: number;
  experienceYears: number;
  bookingConfirmationRequired: boolean;
  minCancellationTime: number;
  maxBookingLeadTime: number;
}

// Client
export interface ClientProfile {
  id: string;
  userId: string;
  avatarUrl?: string | null;
  fullName: string;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientOnboardingInput {
  fullName: string;
  avatarUrl?: string;
  interests: string[];
}

// Service
export interface Service {
  id: string;
  masterId: string;
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  duration: number;
  price: number;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

// Schedule
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface Schedule {
  id: string;
  masterId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive?: boolean;
}

// Appointment
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  masterId: string;
  clientId: string;
  serviceId: string;
  dateTime: string;
  status: AppointmentStatus;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  master?: MasterProfile;
  client?: ClientProfile;
  service?: Service;
}

export interface CreateAppointmentInput {
  masterId: string;
  serviceId: string;
  dateTime: string;
  comment?: string;
}

// Review
export interface Review {
  id: string;
  masterId: string;
  clientId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  client?: {
    fullName: string;
    avatarUrl?: string | null;
  };
}

export interface CreateReviewInput {
  masterId: string;
  rating: number;
  comment?: string;
}

// Portfolio
export interface PortfolioWork {
  id: string;
  masterId: string;
  imageUrl: string;
  title?: string | null;
  description?: string | null;
  createdAt: string;
}

// Search
export interface SearchMastersParams {
  query?: string;
  workFormat?: WorkFormat;
  minRating?: number;
  maxPrice?: number;
  serviceId?: string;
  sortBy?: 'rating' | 'price' | 'reviews' | 'distance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchResults<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Notification
export type NotificationType =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_REMINDER'
  | 'REVIEW_RECEIVED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Favorites
export interface FavoriteMaster {
  id: string;
  masterId: string;
  clientId: string;
  createdAt: string;
  master?: MasterProfile;
}

// Dashboard Stats
export interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalClients: number;
  totalReviews: number;
  averageRating: number;
}

// Master Profile with extended info for search
export interface MasterProfileWithServices extends MasterProfile {
  services: Service[];
}
