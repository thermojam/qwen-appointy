'use client';

import {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {api} from '@/shared/api/client';
import type {Schedule, DayOfWeek} from '@/shared/types/api';
import {Sidebar} from '@/features/dashboard/ui/sidebar';
import {useCurrentUser} from '@/features/auth/hooks/auth.hooks';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card';
import {Button} from '@/shared/ui/button';
import {Input} from '@/shared/ui/input';
import {
    Clock,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Coffee,
} from 'lucide-react';
import {cn} from '@/shared/lib/utils';

const daysOfWeek: Array<{ value: DayOfWeek; label: string }> = [
    {value: 'MONDAY', label: 'Понедельник'},
    {value: 'TUESDAY', label: 'Вторник'},
    {value: 'WEDNESDAY', label: 'Среда'},
    {value: 'THURSDAY', label: 'Четверг'},
    {value: 'FRIDAY', label: 'Пятница'},
    {value: 'SATURDAY', label: 'Суббота'},
    {value: 'SUNDAY', label: 'Воскресенье'},
];

export default function SchedulePage() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'ALL'>('ALL');
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    const [newSchedule, setNewSchedule] = useState<{
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
        breakStart: string;
        breakEnd: string;
        isActive: boolean;
    }>({
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '18:00',
        breakStart: '',
        breakEnd: '',
        isActive: true,
    });

    const currentUserQuery = useCurrentUser();
    const currentUser = currentUserQuery.data;

    const {data: schedules, isLoading} = useQuery({
        queryKey: ['schedule'],
        queryFn: () => api.schedule.getAll(),
        enabled: !!currentUser,
    });

    const createSchedule = useMutation({
        mutationFn: (data: typeof newSchedule) =>
            api.schedule.create({
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                breakStart: data.breakStart || undefined,
                breakEnd: data.breakEnd || undefined,
                isActive: data.isActive,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['schedule']});
            setIsCreating(false);
            setNewSchedule({
                dayOfWeek: 'MONDAY',
                startTime: '09:00',
                endTime: '18:00',
                breakStart: '',
                breakEnd: '',
                isActive: true,
            });
        },
    });

    const updateSchedule = useMutation({
        mutationFn: ({id, data}: { id: string; data: Partial<typeof newSchedule> }) =>
            api.schedule.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['schedule']});
        },
    });

    const deleteSchedule = useMutation({
        mutationFn: (id: string) => api.schedule.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['schedule']});
        },
    });

    const toggleSchedule = useMutation({
        mutationFn: (id: string) => api.schedule.toggle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['schedule']});
        },
    });

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        // Helper to convert time to minutes
        const toMinutes = (time: string) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        // Validate that start != end
        if (newSchedule.startTime === newSchedule.endTime) {
            alert('Время начала и окончания не могут быть одинаковыми');
            return;
        }

        // Validate break time is within working hours (simplified for overnight support)
        if (newSchedule.breakStart && newSchedule.breakEnd) {
            if (newSchedule.breakStart === newSchedule.breakEnd) {
                alert('Перерыв не может иметь одинаковое время начала и окончания');
                return;
            }
        }

        await createSchedule.mutateAsync(newSchedule);
    };

    const handleEditSchedule = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setNewSchedule({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            breakStart: schedule.breakStart || '',
            breakEnd: schedule.breakEnd || '',
            isActive: schedule.isActive,
        });
        setIsCreating(true);
    };

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingSchedule) return;

        // Helper to convert time to minutes
        const toMinutes = (time: string) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        // Validate that start != end
        if (newSchedule.startTime === newSchedule.endTime) {
            alert('Время начала и окончания не могут быть одинаковыми');
            return;
        }

        // Validate break time (simplified for overnight support)
        if (newSchedule.breakStart && newSchedule.breakEnd) {
            if (newSchedule.breakStart === newSchedule.breakEnd) {
                alert('Перерыв не может иметь одинаковое время начала и окончания');
                return;
            }
        }

        await updateSchedule.mutateAsync({
            id: editingSchedule.id,
            data: {
                dayOfWeek: newSchedule.dayOfWeek,
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime,
                breakStart: newSchedule.breakStart || undefined,
                breakEnd: newSchedule.breakEnd || undefined,
                isActive: newSchedule.isActive,
            },
        });

        setEditingSchedule(null);
        setIsCreating(false);
        setNewSchedule({
            dayOfWeek: 'MONDAY',
            startTime: '09:00',
            endTime: '18:00',
            breakStart: '',
            breakEnd: '',
            isActive: true,
        });
    };

    const handleCancelEdit = () => {
        setEditingSchedule(null);
        setIsCreating(false);
        setNewSchedule({
            dayOfWeek: 'MONDAY',
            startTime: '09:00',
            endTime: '18:00',
            breakStart: '',
            breakEnd: '',
            isActive: true,
        });
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    const user = currentUser;
    const masterData = user.master;

    const filteredSchedules = schedules?.filter((schedule) => {
        if (selectedDay === 'ALL') return true;
        return schedule.dayOfWeek === selectedDay;
    });

    const getScheduleForDay = (day: DayOfWeek) => {
        return filteredSchedules?.find((s) => s.dayOfWeek === day);
    };

    const formatTimeRange = (schedule: Schedule) => {
        let time = `${schedule.startTime} - ${schedule.endTime}`;
        if (schedule.breakStart && schedule.breakEnd) {
            time += ` (перерыв ${schedule.breakStart} - ${schedule.breakEnd})`;
        }
        return time;
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
            />

            {/* Main Content */}
            <main className={cn(
                'p-8 transition-all duration-300 ease-in-out',
                'ml-20 md:ml-20 lg:ml-64'
            )}>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-heading text-3xl font-bold mb-2">Расписание</h1>
                    <p className="text-muted-foreground">
                        Управление рабочими часами
                    </p>
                </div>

                {/* Day Filters */}
                <div className="mb-6 flex items-center gap-2 overflow-x-auto">
                    <Button
                        variant={selectedDay === 'ALL' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedDay('ALL')}
                    >
                        Все дни
                    </Button>
                    {daysOfWeek.map((day) => (
                        <Button
                            key={day.value}
                            variant={selectedDay === day.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedDay(day.value)}
                        >
                            {day.label}
                        </Button>
                    ))}
                </div>

                {/* Create/Edit Schedule Form */}
                {isCreating && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{editingSchedule ? 'Редактировать рабочий день' : 'Новый рабочий день'}</CardTitle>
                            <CardDescription>
                                {editingSchedule ? 'Измените параметры рабочего дня' : 'Укажите дни и время работы'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
                                  className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">День недели</label>
                                        <select
                                            value={newSchedule.dayOfWeek}
                                            onChange={(e) =>
                                                setNewSchedule({
                                                    ...newSchedule,
                                                    dayOfWeek: e.target.value as DayOfWeek,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                                        >
                                            {daysOfWeek.map((day) => (
                                                <option key={day.value} value={day.value}>
                                                    {day.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Статус</label>
                                        <div className="flex items-center gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNewSchedule({...newSchedule, isActive: true})
                                                }
                                                className={cn(
                                                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                                                    newSchedule.isActive
                                                        ? 'bg-success/10 text-success'
                                                        : 'bg-secondary text-muted-foreground'
                                                )}
                                            >
                                                <ToggleRight className="w-5 h-5"/>
                                                Активен
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNewSchedule({...newSchedule, isActive: false})
                                                }
                                                className={cn(
                                                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                                                    !newSchedule.isActive
                                                        ? 'bg-muted text-muted-foreground'
                                                        : 'bg-secondary text-muted-foreground'
                                                )}
                                            >
                                                <ToggleLeft className="w-5 h-5"/>
                                                Не активен
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="startTime" className="text-sm font-medium">
                                            Начало работы
                                        </label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={newSchedule.startTime}
                                            onChange={(e) =>
                                                setNewSchedule({...newSchedule, startTime: e.target.value})
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="endTime" className="text-sm font-medium">
                                            Конец работы
                                        </label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={newSchedule.endTime}
                                            onChange={(e) =>
                                                setNewSchedule({...newSchedule, endTime: e.target.value})
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg bg-secondary/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Coffee className="w-4 h-4 text-muted-foreground"/>
                                        <span className="text-sm font-medium">Перерыв (опционально)</span>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="breakStart" className="text-sm font-medium">
                                                Начало перерыва
                                            </label>
                                            <Input
                                                id="breakStart"
                                                type="time"
                                                value={newSchedule.breakStart}
                                                onChange={(e) =>
                                                    setNewSchedule({
                                                        ...newSchedule,
                                                        breakStart: e.target.value,
                                                    })
                                                }
                                                min={newSchedule.startTime}
                                                max={newSchedule.endTime}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Должен быть между {newSchedule.startTime} и {newSchedule.endTime}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="breakEnd" className="text-sm font-medium">
                                                Конец перерыва
                                            </label>
                                            <Input
                                                id="breakEnd"
                                                type="time"
                                                value={newSchedule.breakEnd}
                                                onChange={(e) =>
                                                    setNewSchedule({
                                                        ...newSchedule,
                                                        breakEnd: e.target.value,
                                                    })
                                                }
                                                min={newSchedule.breakStart || newSchedule.startTime}
                                                max={newSchedule.endTime}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Должен быть между началом перерыва и {newSchedule.endTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={createSchedule.isPending || updateSchedule.isPending}
                                    >
                                        {(createSchedule.isPending || updateSchedule.isPending) ? 'Сохранение...' : 'Сохранить'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleCancelEdit}
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Add Button */}
                {!isCreating && (
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="mb-6"
                    >
                        <Plus className="w-4 h-4 mr-2"/>
                        Добавить рабочий день
                    </Button>
                )}

                {/* Schedule Grid */}
                {isLoading ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Загрузка...
                        </CardContent>
                    </Card>
                ) : filteredSchedules && filteredSchedules.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredSchedules.map((schedule) => (
                            <Card
                                key={schedule.id}
                                className={cn(
                                    'card-hover rounded-3xl border-border/50',
                                    !schedule.isActive && 'opacity-60'
                                )}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {daysOfWeek.find((d) => d.value === schedule.dayOfWeek)?.label}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                <Clock className="w-4 h-4"/>
                                                {formatTimeRange(schedule)}
                                            </CardDescription>
                                        </div>
                                        <button
                                            onClick={() => toggleSchedule.mutate(schedule.id)}
                                            className={cn(
                                                'p-2 rounded-lg transition-colors',
                                                schedule.isActive
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-muted text-muted-foreground'
                                            )}
                                        >
                                            {schedule.isActive ? (
                                                <ToggleRight className="w-6 h-6"/>
                                            ) : (
                                                <ToggleLeft className="w-6 h-6"/>
                                            )}
                                        </button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEditSchedule(schedule)}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteSchedule.mutate(schedule.id)}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            {selectedDay === 'ALL'
                                ? 'Расписание пока не настроено. Добавьте рабочие дни!'
                                : `Нет расписания на ${daysOfWeek.find((d) => d.value === selectedDay)?.label}`}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
