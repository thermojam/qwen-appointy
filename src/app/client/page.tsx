'use client';

import {useState, useEffect} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/shared/api/client';
import {useRouter} from 'next/navigation';
import {Button} from '@/shared/ui/button';
import {Card, CardContent} from '@/shared/ui/card';
import {Avatar} from '@/shared/ui/avatar';
import {Badge} from '@/shared/ui/badge';
import {ReviewModal} from '@/shared/ui/review-modal';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from '@/shared/ui/dialog';
import {
    Calendar,
    Clock,
    Star,
    Heart,
    ChevronRight,
    MapPin,
    TrendingUp,
    Users,
    LogOut
} from 'lucide-react';
import {useAuth, useLogout} from '@/features/auth/hooks/auth.hooks';

type Tab = 'appointments' | 'favorites' | 'history';

interface ReviewData {
  appointmentId?: string;
  masterId: string;
  masterName: string;
}

export default function ClientDashboardPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {user, isAuthenticated, isLoading} = useAuth();
    const logout = useLogout();
    const [activeTab, setActiveTab] = useState<Tab>('appointments');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<{id: string; masterName: string; dateTime: string} | null>(null);

    const handleLogout = async () => {
        await logout.mutateAsync();
        router.push('/');
    };

    const handleOpenReviewModal = (masterId: string, masterName: string, appointmentId?: string) => {
        setSelectedReview({ appointmentId, masterId, masterName });
        setReviewModalOpen(true);
    };

    const handleSubmitReview = async (data: { rating: number; comment: string }) => {
        if (!selectedReview) return;

        console.log('[Client Dashboard] Submitting review:', { ...selectedReview, ...data });

        try {
          await api.reviews.create({
            masterId: selectedReview.masterId,
            rating: data.rating,
            comment: data.comment,
          });

          console.log('[Client Dashboard] Review submitted successfully');

          // Инвалидируем кэши для обновления данных
          queryClient.invalidateQueries({ queryKey: ['reviews'] });
          queryClient.invalidateQueries({ queryKey: ['reviews-stats'] });
          queryClient.invalidateQueries({ queryKey: ['reviews-stats-sidebar'] }); // Сброс бейджа в sidebar
          queryClient.invalidateQueries({ queryKey: ['master', selectedReview.masterId] });

          // Бейдж в sidebar обновится в реальном времени (через 15 сек polling или сразу при клике)
        } catch (error) {
          console.error('Failed to submit review:', error);
          // Модалка сама покажет inline-сообщение об ошибке
        }
    };

    const handleOpenCancelModal = (id: string, masterName: string, dateTime: string) => {
        setAppointmentToCancel({ id, masterName, dateTime });
        setCancelModalOpen(true);
    };

    const handleCancelAppointment = async () => {
        if (!appointmentToCancel) return;

        try {
            await api.appointments.cancelClientAppointment(appointmentToCancel.id);

            // Инвалидируем кэш
            queryClient.invalidateQueries({ queryKey: ['client-appointments'] });
            setCancelModalOpen(false);
            setAppointmentToCancel(null);
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
        }
    };

    // Fetch client appointment - вызываем ДО любых условных возвратов
    const {data: appointments, isLoading: appointmentsLoading} = useQuery({
        queryKey: ['client-appointments'],
        queryFn: () => api.appointments.getClientAppointments(),
        enabled: isAuthenticated && user?.role === 'CLIENT',
        refetchInterval: 15000, // Обновлять каждые 15 секунд
    });

    // Fetch favorite masters - вызываем ДО любых условных возвратов
    const {data: favorites, isLoading: favoritesLoading} = useQuery({
        queryKey: ['client-favorites'],
        queryFn: () => api.favorites.getAll(),
        enabled: isAuthenticated && user?.role === 'CLIENT',
        refetchInterval: 30000, // Обновлять каждые 30 секунд
    });

    // Объединяем все loading state в один
    const isPageLoading = isLoading || (isAuthenticated && user?.role === 'CLIENT' && (appointmentsLoading || favoritesLoading));

    // Redirect if not authenticated or not a client
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/sign-in');
        } else if (!isLoading && user?.role !== 'CLIENT') {
            // If master, redirect to master dashboard
            router.push('/dashboard');
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isPageLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    // Upcoming appointments (future)
    const upcomingAppointments = appointments?.filter(
        (a) => new Date(a.dateTime) > new Date()
    ) || [];

    // Past appointments (history)
    const pastAppointments = appointments?.filter(
        (a) => new Date(a.dateTime) <= new Date()
    ) || [];

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatStatus = (status: string) => {
        const statusMap: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
            PENDING: 'warning',
            CONFIRMED: 'success',
            COMPLETED: 'default',
            CANCELLED: 'error',
            NO_SHOW: 'error',
        };
        return statusMap[status] || 'default';
    };

    const statusLabels: Record<string, string> = {
        PENDING: 'Ожидает подтверждения',
        CONFIRMED: 'Подтверждено',
        COMPLETED: 'Завершено',
        CANCELLED: 'Отменено',
        NO_SHOW: 'Не явился',
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header
                className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-bold">Кабинет клиента</h1>
                            <p className="text-sm text-muted-foreground">
                                Управление записями и избранными мастерами
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                className="text-destructive hover:text-destructive"
                                title="Выйти"
                            >
                                <LogOut className="w-5 h-5"/>
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4">
                        <Button
                            variant={activeTab === 'appointments' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('appointments')}
                        >
                            <Calendar className="w-4 h-4 mr-2"/>
                            Записи
                        </Button>
                        <Button
                            variant={activeTab === 'favorites' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('favorites')}
                        >
                            <Heart className="w-4 h-4 mr-2"/>
                            Избранное
                        </Button>
                        <Button
                            variant={activeTab === 'history' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('history')}
                        >
                            <Clock className="w-4 h-4 mr-2"/>
                            История
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <Calendar className="w-6 h-6 text-primary"/>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Активные записи</p>
                                    <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-success/10 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-success"/>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Завершено</p>
                                    <p className="text-2xl font-bold">{pastAppointments.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-warning/10 rounded-full">
                                    <Heart className="w-6 h-6 text-warning"/>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Избранные</p>
                                    <p className="text-2xl font-bold">{favorites?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-info/10 rounded-full">
                                    <Users className="w-6 h-6 text-info"/>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Мастеров</p>
                                    <p className="text-2xl font-bold">
                                        {new Set(appointments?.map(a => a.masterId)).size}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Content */}
                {activeTab === 'appointments' && (
                    <div className="space-y-4">
                        <h2 className="font-heading font-semibold text-xl mb-4">
                            Предстоящие записи
                        </h2>

                        {appointmentsLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div
                                    className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"/>
                            </div>
                        ) : upcomingAppointments.length > 0 ? (
                            <div className="grid gap-4">
                                {upcomingAppointments.map((appointment) => (
                                    <Card key={appointment.id} className="card-hover">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <Avatar
                                                        src={appointment.master?.avatarUrl}
                                                        fallback={appointment.master?.fullName?.charAt(0) || 'M'}
                                                        size="lg"
                                                    />
                                                    <div>
                                                        <h3 className="font-heading font-semibold text-lg">
                                                            {appointment.master?.fullName}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {appointment.service?.name}
                                                        </p>
                                                        <div
                                                            className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4"/>
                                  {formatDateTime(appointment.dateTime)}
                              </span>
                                                            <Badge variant={formatStatus(appointment.status)}>
                                                                {statusLabels[appointment.status]}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/masters/${appointment.masterId}`)}
                                                    >
                                                        К мастеру
                                                    </Button>
                                                    {appointment.status === 'PENDING' && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleOpenCancelModal(
                                                                appointment.id,
                                                                appointment.master?.fullName || 'Мастер',
                                                                formatDateTime(appointment.dateTime)
                                                            )}
                                                        >
                                                            Отменить
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
                                    <h3 className="font-heading font-semibold text-lg mb-2">
                                        Нет предстоящих записей
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Запишитесь к мастеру прямо сейчас
                                    </p>
                                    <Button onClick={() => router.push('/search')}>
                                        Найти мастера
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === 'favorites' && (
                    <div className="space-y-4">
                        <h2 className="font-heading font-semibold text-xl mb-4">
                            Избранные мастера
                        </h2>

                        {favoritesLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div
                                    className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"/>
                            </div>
                        ) : favorites && favorites.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {favorites.map((fav) => (
                                    <Card
                                        key={fav.id}
                                        className="card-hover cursor-pointer"
                                        onClick={() => router.push(`/masters/${fav.masterId}`)}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <Avatar
                                                    src={fav.master?.avatarUrl}
                                                    fallback={fav.master?.fullName?.charAt(0) || 'M'}
                                                    size="lg"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-heading font-semibold">
                                                        {fav.master?.fullName}
                                                    </h3>
                                                    <div
                                                        className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                                        <Star className="w-3 h-3 fill-warning text-warning"/>
                                                        <span>{fav.master?.rating?.toFixed(1) || '0.0'}</span>
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                        <MapPin className="w-3 h-3"/>
                                                        <span>{fav.master?.workFormat}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted-foreground"/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
                                    <h3 className="font-heading font-semibold text-lg mb-2">
                                        Нет избранных мастеров
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Добавьте мастеров в избранное для быстрого доступа
                                    </p>
                                    <Button onClick={() => router.push('/search')}>
                                        Найти мастера
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <h2 className="font-heading font-semibold text-xl mb-4">
                            История записей
                        </h2>

                        {appointmentsLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div
                                    className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"/>
                            </div>
                        ) : pastAppointments.length > 0 ? (
                            <div className="grid gap-4">
                                {pastAppointments.map((appointment) => (
                                    <Card key={appointment.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <Avatar
                                                        src={appointment.master?.avatarUrl}
                                                        fallback={appointment.master?.fullName?.charAt(0) || 'M'}
                                                        size="lg"
                                                    />
                                                    <div>
                                                        <h3 className="font-heading font-semibold text-lg">
                                                            {appointment.master?.fullName}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {appointment.service?.name}
                                                        </p>
                                                        <div
                                                            className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4"/>
                                  {formatDateTime(appointment.dateTime)}
                              </span>
                                                            <Badge variant={formatStatus(appointment.status)}>
                                                                {statusLabels[appointment.status]}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {appointment.status === 'COMPLETED' ? (
                                                        <Button
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={() => handleOpenReviewModal(
                                                            appointment.masterId,
                                                            appointment.master?.fullName || 'Мастер',
                                                            appointment.id
                                                          )}
                                                        >
                                                            <Star className="w-4 h-4 mr-2"/>
                                                            Оставить отзыв
                                                        </Button>
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Clock className="w-3 h-3"/>
                                                            <span>Отзыв доступен после завершения</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-16 text-center">
                                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
                                    <h3 className="font-heading font-semibold text-lg mb-2">
                                        История пуста
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        У вас пока нет завершенных записей
                                    </p>
                                    <Button onClick={() => router.push('/search')}>
                                        Записаться к мастеру
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </main>

            {/* Review Modal */}
            {selectedReview && (
              <ReviewModal
                open={reviewModalOpen}
                onOpenChange={setReviewModalOpen}
                onSubmit={handleSubmitReview}
                masterName={selectedReview.masterName}
              />
            )}

            {/* Cancel Appointment Modal */}
            {appointmentToCancel && (
              <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Отменить запись</DialogTitle>
                    <DialogDescription>
                      Вы уверены, что хотите отменить запись к мастеру {appointmentToCancel.masterName} на {appointmentToCancel.dateTime}?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCancelModalOpen(false);
                        setAppointmentToCancel(null);
                      }}
                    >
                      Нет, оставить запись
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelAppointment}
                    >
                      Да, отменить запись
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
        </div>
    );
}
