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
    CreateReviewInput,
} from '@/shared/types/api';
import {useAuthStore} from '@/features/auth/store/auth.store';

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

// Флаг для предотвращения множественных refresh запросов
let isRefreshing = false;
// Очередь запросов, ожидающих refresh
let failedQueue: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

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
        const token = state?.accessToken || null;
        if (!token) {
            console.warn('[API] No auth token found in store');
        } else {
            console.log('[API] Using token:', token.substring(0, 20) + '...');
        }
        return token;
    } catch (error) {
        console.warn('Failed to get auth token from store:', error);
        return null;
    }
}

/**
 * Получает refresh токен из store
 */
function getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        const state = useAuthStore.getState();
        return state?.refreshToken || null;
    } catch {
        return null;
    }
}

/**
 * Обновляет access токен используя refresh токен
 */
async function refreshAuthToken(): Promise<string> {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
        throw new ApiError(401, 'NO_REFRESH_TOKEN', 'Refresh token not found');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        // Refresh token тоже истёк - очищаем всё
        useAuthStore.getState().clearTokens();
        throw new ApiError(
            response.status,
            data.code || 'REFRESH_FAILED',
            data.error || 'Failed to refresh token'
        );
    }

    // Сохраняем новые токены
    const { accessToken, refreshToken: newRefreshToken } = data.data;
    useAuthStore.getState().setTokens(accessToken, newRefreshToken);
    
    return accessToken;
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && {Authorization: `Bearer ${token}`}),
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

    // Если получили 401 и токен ещё не обновляем - пробуем refresh
    if (response.status === 401 && !isRefreshing) {
        isRefreshing = true;
        
        try {
            const newToken = await refreshAuthToken();
            
            // Повторяем оригинальный запрос с новым токеном
            const retryResponse = await fetch(url, {
                ...options,
                headers: {
                    ...headers,
                    Authorization: `Bearer ${newToken}`,
                },
            });
            
            processQueue();
            return handleResponse<T>(retryResponse);
        } catch (refreshError) {
            processQueue(refreshError as Error);
            throw refreshError;
        } finally {
            isRefreshing = false;
        }
    }

    // Если уже идёт refresh - добавляем запрос в очередь
    if (response.status === 401 && isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({
                resolve: () => {
                    // Повторяем запрос после успешного refresh
                    const token = getAuthToken();
                    fetch(url, {
                        ...options,
                        headers: {
                            ...headers,
                            Authorization: `Bearer ${token}`,
                        },
                    }).then(async (retryResponse) => {
                        try {
                            const data = await handleResponse<T>(retryResponse);
                            resolve(data);
                        } catch (error) {
                            reject(error as Error);
                        }
                    }).catch(reject);
                },
                reject,
            });
        });
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
                body: JSON.stringify({refreshToken}),
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
            // Фильтруем undefined значения перед созданием query string
            const filteredParams: Record<string, string> = {};
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        filteredParams[key] = String(value);
                    }
                });
            }
            const queryString = new URLSearchParams(filteredParams).toString();
            return request<SearchResults<MasterProfile>>(
                `/search/masters${queryString ? `?${queryString}` : ''}`
            );
        },
        masterById: (id: string) => {
            if (!id || id === ':masterId') {
                throw new Error('Invalid master ID');
            }
            return request<MasterProfile>(`/search/masters/${encodeURIComponent(id)}`);
        },
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
                body: JSON.stringify({status}),
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
        createAppointment: (data: CreateAppointmentInput) =>
            request<Appointment>('/appointments/client', {
                method: 'POST',
                body: JSON.stringify(data),
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
                body: JSON.stringify({avatarUrl}),
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
        create: (data: CreateReviewInput) =>
            request<Review>('/reviews', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: string, data: { rating?: number; comment?: string }) =>
            request<Review>(`/reviews/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
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

    // Favorites
    favorites: {
        getAll: (params?: { page?: number; limit?: number }) => {
            const queryString = params
                ? new URLSearchParams(params as Record<string, string>).toString()
                : '';
            return request<{
                data: import('@/shared/types/api').MasterProfile[];
                pagination: {
                    page: number;
                    limit: number;
                    total: number;
                    totalPages: number;
                };
            }>(`/favorites${queryString ? `?${queryString}` : ''}`);
        },
        add: (masterId: string) =>
            request<{
                id: string;
                masterId: string;
                clientId: string;
                createdAt: string;
            }>('/favorites', {
                method: 'POST',
                body: JSON.stringify({masterId}),
            }),
        remove: (masterId: string) =>
            request<{ message: string }>(`/favorites/${masterId}`, {
                method: 'DELETE',
            }),
        check: (masterId: string) =>
            request<{ isFavorite: boolean }>(`/favorites/check/${masterId}`),
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

export {ApiError};
export default api;
