'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { useCurrentUser, useLogout } from '@/features/auth/hooks/auth.hooks';
import { Sidebar } from '@/features/dashboard/ui/sidebar';
import { Card, CardContent } from '@/shared/ui/card';
import type { User } from '@/shared/types/api';
import { 
  Calendar,
  DollarSign,
  Users,
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();
  const logout = useLogout();

  const currentUser = currentUserQuery.data;
  const isLoading = currentUserQuery.isLoading;

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.dashboard.getStats(),
    enabled: !!currentUser,
  });

  const { data: upcoming } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: () => api.dashboard.getUpcoming(5),
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push('/auth/login');
    }
  }, [currentUser, isLoading, router]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/');
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = currentUser as User;
  const masterData = user.master;

  // Stats cards data
  const statsCards = [
    {
      title: 'Записей сегодня',
      value: stats?.todayAppointments || 0,
      change: stats && stats.todayAppointments > 0 ? '+1' : '0',
      isPositive: true,
      icon: Calendar,
    },
    {
      title: 'Заработано сегодня',
      value: `${stats?.todayRevenue || 0} ₽`,
      change: stats && stats.todayRevenue > 0 ? '+15%' : '0%',
      isPositive: (stats?.todayRevenue || 0) > 0,
      icon: DollarSign,
    },
    {
      title: 'Всего клиентов',
      value: stats?.totalClients || 0,
      change: '+2',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Рейтинг',
      value: stats?.averageRating ? `${stats.averageRating.toFixed(1)} ★` : '—',
      change: stats && stats.averageRating >= 4.5 ? '+0.1' : '0',
      isPositive: (stats?.averageRating || 0) >= 4.5,
      icon: Star,
    },
  ];

  // Pending appointments count
  const pendingCount = (stats?.pendingAppointments || 0) + (stats?.confirmedAppointments || 0);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning/10 text-warning';
      case 'CONFIRMED':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает';
      case 'CONFIRMED':
        return 'Подтверждено';
      default:
        return status;
    }
  };

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
      <main className="ml-64 p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            С возвращением, {masterData?.fullName?.split(' ')[0] || 'Мастер'}!
          </h1>
          <p className="text-muted-foreground">
            Вот краткий обзор вашего бизнеса на сегодня:
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-hover rounded-3xl border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        stat.isPositive ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      {stat.isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="font-heading text-3xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold">
                      Предстоящие записи
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {pendingCount} ожидают внимания
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard/appointments')}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Все записи →
                </button>
              </div>

              {upcoming && upcoming.length > 0 ? (
                <div className="space-y-3">
                  {upcoming.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                        {appointment.client.avatarUrl ? (
                          <img
                            src={appointment.client.avatarUrl}
                            alt={appointment.client.fullName}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {appointment.client.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service.name} • {formatDateTime(appointment.dateTime)}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Нет предстоящих записей</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold">
                    Обзор
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Общая статистика
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Ожидают</span>
                  </div>
                  <span className="font-semibold">{stats?.pendingAppointments || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Подтверждено</span>
                  </div>
                  <span className="font-semibold">{stats?.confirmedAppointments || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Отзывов</span>
                  </div>
                  <span className="font-semibold">{stats?.totalReviews || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Всего записей</span>
                  </div>
                  <span className="font-semibold">{stats?.totalAppointments || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
