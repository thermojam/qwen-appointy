import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkFormat, DayOfWeek } from '@prisma/client';

export interface ScheduleDay {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
}

interface MasterOnboardingData {
  // Step 1
  fullName: string;
  avatarUrl: string;
  experienceYears: number;

  // Step 2
  workFormat: WorkFormat;
  address: string;
  latitude?: number;
  longitude?: number;

  // Step 3
  description: string;
  serviceIds: string[];

  // Step 4
  bookingConfirmationRequired: boolean;
  minCancellationTime: number;
  maxBookingLeadTime: number;

  // Step 5
  schedule: ScheduleDay[];

  // Step 6
  agreedToTerms: boolean;
}

interface ClientOnboardingData {
  // Step 1
  fullName: string;
  avatarUrl: string;

  // Step 2
  interests: string[];

  // Step 3
  agreedToTerms: boolean;
}

interface OnboardingState {
  // Common
  currentStep: number;

  // Master data
  master: MasterOnboardingData;

  // Client data
  client: ClientOnboardingData;

  // Actions
  setCurrentStep: (step: number) => void;

  // Master actions
  updateMasterData: (data: Partial<MasterOnboardingData>) => void;
  updateMasterSchedule: (schedule: ScheduleDay[]) => void;

  // Client actions
  updateClientData: (data: Partial<ClientOnboardingData>) => void;
  addClientInterest: (interest: string) => void;
  removeClientInterest: (interest: string) => void;

  // Reset
  resetOnboarding: () => void;
}

const defaultSchedule: ScheduleDay[] = [
  { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 'SATURDAY', startTime: '10:00', endTime: '16:00', isActive: false },
  { dayOfWeek: 'SUNDAY', startTime: '10:00', endTime: '16:00', isActive: false },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,

      master: {
        fullName: '',
        avatarUrl: '',
        experienceYears: 0,
        workFormat: 'BOTH',
        address: '',
        latitude: undefined,
        longitude: undefined,
        description: '',
        serviceIds: [],
        bookingConfirmationRequired: true,
        minCancellationTime: 24,
        maxBookingLeadTime: 30,
        schedule: defaultSchedule,
        agreedToTerms: false,
      },

      client: {
        fullName: '',
        avatarUrl: '',
        interests: [],
        agreedToTerms: false,
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      updateMasterData: (data) => {
        set((state) => ({
          master: { ...state.master, ...data },
        }));
      },

      updateMasterSchedule: (schedule) => {
        set((state) => ({
          master: { ...state.master, schedule },
        }));
      },

      updateClientData: (data) => {
        set((state) => ({
          client: { ...state.client, ...data },
        }));
      },

      addClientInterest: (interest) => {
        set((state) => ({
          client: {
            ...state.client,
            interests: [...state.client.interests, interest],
          },
        }));
      },

      removeClientInterest: (interest) => {
        set((state) => ({
          client: {
            ...state.client,
            interests: state.client.interests.filter((i) => i !== interest),
          },
        }));
      },

      resetOnboarding: () => {
        set({
          currentStep: 0,
          master: {
            fullName: '',
            avatarUrl: '',
            experienceYears: 0,
            workFormat: 'BOTH',
            address: '',
            latitude: undefined,
            longitude: undefined,
            description: '',
            serviceIds: [],
            bookingConfirmationRequired: true,
            minCancellationTime: 24,
            maxBookingLeadTime: 30,
            schedule: defaultSchedule,
            agreedToTerms: false,
          },
          client: {
            fullName: '',
            avatarUrl: '',
            interests: [],
            agreedToTerms: false,
          },
        });
      },
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        master: state.master,
        client: state.client,
        currentStep: state.currentStep,
      }),
    }
  )
);
