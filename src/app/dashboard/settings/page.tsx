'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { WorkFormat } from '@/shared/types/api';
import { Sidebar } from '@/features/dashboard/ui/sidebar';
import { useCurrentUser, useLogout } from '@/features/auth/hooks/auth.hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Clock,
  MapPin,
  Bell,
  Shield,
  Save,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'booking' | 'work'>('profile');
  
  const currentUserQuery = useCurrentUser();
  const logout = useLogout();
  const currentUser = currentUserQuery.data;

  const { data: settings, isLoading } = useQuery({
    queryKey: ['master-settings'],
    queryFn: () => api.masterSettings.get(),
    enabled: !!currentUser,
  });

  const updateProfile = useMutation({
    mutationFn: (data: {
      fullName?: string;
      description?: string;
      experienceYears?: number;
    }) => api.masterSettings.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-settings'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const updateSettings = useMutation({
    mutationFn: (data: {
      workFormat?: WorkFormat;
      address?: string;
      bookingConfirmationRequired?: boolean;
      minCancellationTime?: number;
      maxBookingLeadTime?: number;
    }) => api.masterSettings.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-settings'] });
    },
  });

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = currentUser;
  const masterData = user.master;

  const [profileForm, setProfileForm] = useState({
    fullName: settings?.fullName || masterData?.fullName || '',
    description: settings?.description || '',
    experienceYears: settings?.experienceYears || 0,
  });

  const [bookingForm, setBookingForm] = useState({
    bookingConfirmationRequired: settings?.bookingConfirmationRequired ?? true,
    minCancellationTime: settings?.minCancellationTime ?? 24,
    maxBookingLeadTime: settings?.maxBookingLeadTime ?? 30,
  });

  const [workForm, setWorkForm] = useState({
    workFormat: settings?.workFormat || 'BOTH',
    address: settings?.address || '',
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(profileForm);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings.mutateAsync({
      bookingConfirmationRequired: bookingForm.bookingConfirmationRequired,
      minCancellationTime: bookingForm.minCancellationTime,
      maxBookingLeadTime: bookingForm.maxBookingLeadTime,
    });
  };

  const handleWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings.mutateAsync({
      workFormat: workForm.workFormat as WorkFormat,
      address: workForm.address,
    });
  };

  const tabs = [
    { id: 'profile' as const, label: 'Профиль', icon: User },
    { id: 'booking' as const, label: 'Записи', icon: Clock },
    { id: 'work' as const, label: 'Работа', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        user={{
          fullName: masterData?.fullName,
          email: user.email,
          avatar: masterData?.avatarUrl,
        }}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={cn(
        'p-8 transition-all duration-300 ease-in-out',
        'ml-20 md:ml-20 lg:ml-64'
      )}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Настройки</h1>
          <p className="text-muted-foreground">
            Управление профилем и параметрами работы
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              Загрузка...
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="rounded-3xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle>Личная информация</CardTitle>
                      <CardDescription>
                        Измените ваши личные данные
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium">
                        ФИО
                      </label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, fullName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        О себе
                      </label>
                      <textarea
                        id="description"
                        value={profileForm.description}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, description: e.target.value })
                        }
                        rows={4}
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none"
                        placeholder="Расскажите о своем опыте и специализации..."
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {profileForm.description.length}/1000
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="experience" className="text-sm font-medium">
                        Опыт работы (лет)
                      </label>
                      <Input
                        id="experience"
                        type="number"
                        min={0}
                        max={50}
                        value={profileForm.experienceYears}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            experienceYears: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Booking Tab */}
            {activeTab === 'booking' && (
              <Card className="rounded-3xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle>Правила записи</CardTitle>
                      <CardDescription>
                        Настройте параметры бронирования
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div className="p-4 border rounded-xl bg-secondary/50">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="confirmationRequired"
                          checked={bookingForm.bookingConfirmationRequired}
                          onChange={(e) =>
                            setBookingForm({
                              ...bookingForm,
                              bookingConfirmationRequired: e.target.checked,
                            })
                          }
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="confirmationRequired"
                            className="text-sm font-medium cursor-pointer"
                          >
                            Требуется подтверждение записи
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Если включено, новые записи будут иметь статус "Ожидает подтверждения"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="minCancellation" className="text-sm font-medium">
                        Минимальное время отмены (часов)
                      </label>
                      <Input
                        id="minCancellation"
                        type="number"
                        min={1}
                        max={168}
                        value={bookingForm.minCancellationTime}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            minCancellationTime: parseInt(e.target.value) || 24,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Клиенты могут отменить запись не позднее чем за {bookingForm.minCancellationTime} ч.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="maxLeadTime" className="text-sm font-medium">
                        Максимальное время записи (дней)
                      </label>
                      <Input
                        id="maxLeadTime"
                        type="number"
                        min={1}
                        max={365}
                        value={bookingForm.maxBookingLeadTime}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            maxBookingLeadTime: parseInt(e.target.value) || 30,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Клиенты могут записываться не более чем за {bookingForm.maxBookingLeadTime} дн.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateSettings.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateSettings.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Work Tab */}
            {activeTab === 'work' && (
              <Card className="rounded-3xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle>Формат работы</CardTitle>
                      <CardDescription>
                        Настройте место и формат приема клиентов
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWorkSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Формат работы</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'ONLINE', label: 'Онлайн' },
                          { value: 'OFFLINE', label: 'Офлайн' },
                          { value: 'BOTH', label: 'Оба' },
                        ].map((format) => (
                          <button
                            key={format.value}
                            type="button"
                            onClick={() =>
                              setWorkForm({ ...workForm, workFormat: format.value as WorkFormat })
                            }
                            className={cn(
                              'px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors',
                              workForm.workFormat === format.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                            )}
                          >
                            {format.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(workForm.workFormat === 'OFFLINE' || workForm.workFormat === 'BOTH') && (
                      <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium">
                          Адрес приема
                        </label>
                        <Input
                          id="address"
                          value={workForm.address}
                          onChange={(e) =>
                            setWorkForm({ ...workForm, address: e.target.value })
                          }
                          placeholder="Город, улица, дом, офис"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={updateSettings.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateSettings.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ');
}
