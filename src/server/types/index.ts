export enum UserRole {
    MASTER = 'MASTER',
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
}

export enum AccountStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    DELETED = 'DELETED',
}

export enum WorkFormat {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    BOTH = 'BOTH',
}

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

export enum AppointmentStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}

export enum NotificationType {
    APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
    APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
    APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
    APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
    REVIEW_RECEIVED = 'REVIEW_RECEIVED',
    SYSTEM = 'SYSTEM',
}

export interface JwtPayload {
    userId: string;
    role: UserRole;
}

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
