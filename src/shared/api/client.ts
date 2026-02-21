import type {
  User,
  MasterProfile,
  ClientProfile,
  Service,
  SearchResults,
  MasterOnboardingInput,
  ClientOnboardingInput,
  CreateServiceInput,
  UpdateServiceInput,
  SearchMastersParams,
  Appointment,
  CreateAppointmentInput,
  AppointmentStatus,
  Schedule,
  CreateScheduleInput,
  DayOfWeek,
  WorkFormat,
  Notification,
  NotificationType,
  Review,
  PortfolioWork,
} from '@/shared/types/api';
import { useAuthStore } from '@/features/auth/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.code || 'API_ERROR',
      data.error || 'Request failed'
    );
  }

  if (!data.success) {
    throw new ApiError(
      response.status,
      data.code || 'API_ERROR',
      data.error || 'Request failed'
    );
  }

  return data.data;
}

/**
 * Получает токен из Zustand store
 * В браузере используем store, на сервере - null
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const state = useAuthStore.getState();
    return state?.accessToken || null;
  } catch (error) {
    console.warn('Failed to get auth token from store:', error);
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const url = `${API_URL}${endpoint}`;
  
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    // Сетевая ошибка - сервер недоступен
    console.error('API request failed - server unavailable:', url, error);
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Сервер недоступен. Убедитесь, что backend запущен на порту 3001.'
    );
  }

  return handleResponse<T>(response);
}

export const api = {
  // Auth
  auth: {
    register: (data: { email: string; password: string; role: string }) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    refresh: (refreshToken: string) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
    me: () => request<User>('/auth/me'),
  },

  // Onboarding
  onboarding: {
    completeMaster: (data: MasterOnboardingInput) =>
      request<MasterProfile>('/onboarding/master', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    completeClient: (data: ClientOnboardingInput) =>
      request<ClientProfile>('/onboarding/client', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Services
  services: {
    getAll: () => request<Service[]>('/services'),
    create: (data: CreateServiceInput) =>
      request<Service>('/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateServiceInput) =>
      request<Service>(`/services/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/services/${id}`, {
        method: 'DELETE',
      }),
  },

  // Search
  search: {
    masters: (params?: SearchMastersParams) => {
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      return request<SearchResults<MasterProfile>>(
        `/search/masters${queryString ? `?${queryString}` : ''}`
      );
    },
    masterById: (id: string) =>
      request<MasterProfile>(`/search/masters/${id}`),
  },

  // Appointments
  appointments: {
    // Master
    getMasterAppointments: (filters?: {
      status?: AppointmentStatus;
      startDate?: string;
      endDate?: string;
    }) => {
      const queryString = filters
        ? new URLSearchParams(filters as Record<string, string>).toString()
        : '';
      return request<Appointment[]>(
        `/appointments/master${queryString ? `?${queryString}` : ''}`
      );
    },
    getMasterAppointmentById: (id: string) =>
      request<Appointment>(`/appointments/master/${id}`),
    updateStatus: (id: string, status: AppointmentStatus) =>
      request<Appointment>(`/appointments/master/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    confirm: (id: string) =>
      request<Appointment>(`/appointments/master/${id}/confirm`, {
        method: 'POST',
      }),
    cancel: (id: string) =>
      request<Appointment>(`/appointments/master/${id}/cancel`, {
        method: 'POST',
      }),
    complete: (id: string) =>
      request<Appointment>(`/appointments/master/${id}/complete`, {
        method: 'POST',
      }),

    // Client
    getClientAppointments: () =>
      request<Appointment[]>('/appointments/client'),
    getClientAppointmentById: (id: string) =>
      request<Appointment>(`/appointments/client/${id}`),
    cancelClientAppointment: (id: string) =>
      request<Appointment>(`/appointments/client/${id}/cancel`, {
        method: 'POST',
      }),
  },

  // Schedule
  schedule: {
    getAll: (dayOfWeek?: DayOfWeek) => {
      const queryString = dayOfWeek ? `?dayOfWeek=${dayOfWeek}` : '';
      return request<Schedule[]>(`/schedule${queryString}`);
    },
    getById: (id: string) =>
      request<Schedule>(`/schedule/${id}`),
    create: (data: CreateScheduleInput) =>
      request<Schedule>('/schedule', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<CreateScheduleInput>) =>
      request<Schedule>(`/schedule/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/schedule/${id}`, {
        method: 'DELETE',
      }),
    toggle: (id: string) =>
      request<Schedule>(`/schedule/${id}/toggle`, {
        method: 'POST',
      }),
    getAvailableSlots: (masterId: string, date: string, serviceDuration: number) =>
      request<string[]>(`/schedule/${masterId}/available-slots?date=${date}&serviceDuration=${serviceDuration}`),
  },

  // Master Settings
  masterSettings: {
    get: () =>
      request<MasterProfile>('/master-settings'),
    updateSettings: (data: {
      workFormat?: WorkFormat;
      address?: string;
      latitude?: number;
      longitude?: number;
      bookingConfirmationRequired?: boolean;
      minCancellationTime?: number;
      maxBookingLeadTime?: number;
    }) =>
      request<MasterProfile>('/master-settings/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updateProfile: (data: {
      fullName?: string;
      description?: string;
      avatarUrl?: string;
      experienceYears?: number;
    }) =>
      request<MasterProfile>('/master-settings/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updateAvatar: (avatarUrl: string) =>
      request<MasterProfile>('/master-settings/avatar', {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl }),
      }),
    delete: () =>
      request<{ message: string }>('/master-settings', {
        method: 'DELETE',
      }),
  },

  // Notifications
  notifications: {
    getAll: (filters?: {
      type?: NotificationType;
      isRead?: boolean;
      limit?: number;
      offset?: number;
    }) => {
      const queryString = filters
        ? new URLSearchParams(filters as Record<string, string>).toString()
        : '';
      return request<Notification[]>(`/notifications${queryString ? `?${queryString}` : ''}`);
    },
    getUnreadCount: () =>
      request<{ count: number }>('/notifications/unread-count'),
    markAsRead: (id: string) =>
      request<{ message: string }>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllAsRead: () =>
      request<{ message: string }>('/notifications/read-all', {
        method: 'PATCH',
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/notifications/${id}`, {
        method: 'DELETE',
      }),
    deleteAllRead: () =>
      request<{ message: string }>('/notifications/read-all', {
        method: 'DELETE',
      }),
  },

  // Reviews
  reviews: {
    getAll: (filters?: {
      minRating?: number;
      maxRating?: number;
      limit?: number;
      offset?: number;
    }) => {
      const queryString = filters
        ? new URLSearchParams(filters as Record<string, string>).toString()
        : '';
      return request<Review[]>(`/reviews${queryString ? `?${queryString}` : ''}`);
    },
    getStats: () =>
      request<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<number, number>;
      }>('/reviews/stats'),
    getById: (id: string) =>
      request<Review>(`/reviews/${id}`),
    delete: (id: string) =>
      request<{ message: string }>(`/reviews/${id}`, {
        method: 'DELETE',
      }),
  },

  // Portfolio
  portfolio: {
    getAll: () =>
      request<PortfolioWork[]>('/portfolio'),
    getById: (id: string) =>
      request<PortfolioWork>(`/portfolio/${id}`),
    create: (data: {
      imageUrl: string;
      title?: string;
      description?: string;
    }) =>
      request<PortfolioWork>('/portfolio', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: {
      title?: string;
      description?: string;
    }) =>
      request<PortfolioWork>(`/portfolio/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/portfolio/${id}`, {
        method: 'DELETE',
      }),
  },

  // Dashboard
  dashboard: {
    getStats: () =>
      request<{
        todayAppointments: number;
        todayRevenue: number;
        totalAppointments: number;
        pendingAppointments: number;
        confirmedAppointments: number;
        totalClients: number;
        totalReviews: number;
        averageRating: number;
      }>('/dashboard/stats'),
    getUpcoming: (limit?: number) => {
      const queryString = limit ? `?limit=${limit}` : '';
      return request<Array<{
        id: string;
        dateTime: string;
        status: string;
        service: {
          name: string;
          duration: number;
          price: number;
        };
        client: {
          fullName: string;
          avatarUrl: string | null;
          phone: string | null;
        };
      }>>(`/dashboard/upcoming${queryString}`);
    },
    getActivity: (limit?: number) => {
      const queryString = limit ? `?limit=${limit}` : '';
      return request<Array<{
        id: string;
        dateTime: string;
        status: string;
        createdAt: string;
        service: {
          name: string;
        };
        client: {
          fullName: string;
          avatarUrl: string | null;
        };
      }>>(`/dashboard/activity${queryString}`);
    },
  },
};

export { ApiError };
export default api;
