'use client';

import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/shared/api/client';
import type {Service, CreateServiceInput, UpdateServiceInput} from '@/shared/types/api';
import {Button} from '@/shared/ui/button';
import {Input} from '@/shared/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card';
import {Badge} from '@/shared/ui/badge';
import {useRouter} from 'next/navigation';
import {cn} from '@/shared/lib/utils';
import {Sidebar} from '@/features/dashboard/ui/sidebar';
import {useCurrentUser, useLogout} from '@/features/auth/hooks/auth.hooks';
import {useEffect} from 'react';
import {EyeOff, Pencil, Power, Trash2} from 'lucide-react';

export default function ServicesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {data: user} = useCurrentUser();
    const logout = useLogout();
    const [isCreating, setIsCreating] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState<CreateServiceInput | UpdateServiceInput>({
        name: '',
        description: '',
        duration: 60,
        price: 0,
    });

    const {data: services, isLoading} = useQuery({
        queryKey: ['services'],
        queryFn: () => api.services.getAll(),
    });

    const createService = useMutation({
        mutationFn: (data: CreateServiceInput) => api.services.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['services']});
            setIsCreating(false);
            setFormData({name: '', description: '', duration: 60, price: 0});
        },
    });

    const updateService = useMutation({
        mutationFn: ({id, data}: { id: string; data: UpdateServiceInput }) =>
            api.services.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['services']});
            setEditingService(null);
            setFormData({name: '', description: '', duration: 60, price: 0});
        },
    });

    const deleteService = useMutation({
        mutationFn: (id: string) => api.services.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['services']});
        },
    });

    const toggleServiceStatus = useMutation({
        mutationFn: ({id, isActive}: { id: string; isActive: boolean }) =>
            api.services.update(id, {isActive}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['services']});
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingService) {
            await updateService.mutateAsync({id: editingService.id, data: formData});
        } else {
            await createService.mutateAsync(formData as CreateServiceInput);
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            duration: service.duration,
            price: Number(service.price),
        });
        setIsCreating(false);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingService(null);
        setFormData({name: '', description: '', duration: 60, price: 0});
    };

    const handleLogout = async () => {
        await logout.mutateAsync();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar 
                user={user?.master || user?.client ? {
                    fullName: user.master?.fullName || user.client?.fullName,
                    email: user.email,
                    avatar: user.master?.avatarUrl || user.client?.avatarUrl,
                } : undefined}
                onLogout={handleLogout}
            />

            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Мои услуги</h1>
                        <p className="text-sm text-muted-foreground">
                            Управление услугами и ценами
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            Назад
                        </Button>
                        <Button onClick={() => setIsCreating(!isCreating)}>
                            {isCreating ? 'Отмена' : '+ Добавить услугу'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={cn(
                'p-8 transition-all duration-300 ease-in-out',
                'ml-20 md:ml-20 lg:ml-64'
            )}>
                {/* Create/Edit Service Form */}
                {(isCreating || editingService) && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{editingService ? 'Редактирование услуги' : 'Новая услуга'}</CardTitle>
                            <CardDescription>
                                {editingService ? 'Измените информацию об услуге' : 'Заполните информацию об услуге'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">
                                            Название
                                        </label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({...formData, name: e.target.value})
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="price" className="text-sm font-medium">
                                            Цена (₽)
                                        </label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min={0}
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    price: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium">
                                        Описание
                                    </label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({...formData, description: e.target.value})
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="duration" className="text-sm font-medium">
                                        Длительность (минуты)
                                    </label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min={15}
                                        step={15}
                                        value={formData.duration}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                duration: parseInt(e.target.value) || 60,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={createService.isPending || updateService.isPending}
                                    >
                                        {createService.isPending || updateService.isPending ? 'Сохранение...' : 'Сохранить'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleCancel}
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Services List */}
                {isLoading ? (
                    <p className="text-center text-muted-foreground">Загрузка...</p>
                ) : services && services.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <Card 
                                key={service.id}
                                className={cn(
                                    'transition-all duration-300',
                                    !service.isActive && 'opacity-60 hover:opacity-100 bg-muted/30'
                                )}
                            >
                                {/* Status bar - полоска статуса сверху */}
                                <div className={cn(
                                    'h-1.5 rounded-t-3xl transition-colors',
                                    service.isActive 
                                        ? 'bg-success' 
                                        : 'bg-muted'
                                )} />
                                
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">{service.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {service.description}
                                            </CardDescription>
                                        </div>
                                        {!service.isActive && (
                                            <Badge 
                                                variant="secondary" 
                                                className="bg-muted text-muted-foreground flex-shrink-0"
                                                title="Услуга скрыта от клиентов"
                                            >
                                                <EyeOff className="w-3 h-3 mr-1" />
                                                Скрыта
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className={cn(
                                                'text-2xl font-bold',
                                                !service.isActive && 'line-through text-muted-foreground'
                                            )}>
                                                {service.price} ₽
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {service.duration} мин
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'text-xs',
                                                service.isActive 
                                                    ? 'border-success text-success bg-success/10' 
                                                    : 'border-muted text-muted-foreground'
                                            )}
                                        >
                                            {service.isActive ? 'Активна' : 'Неактивна'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 pt-2 border-t">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(service)}
                                            className="h-10 w-10 hover:bg-primary/10 hover:text-primary"
                                            title="Редактировать"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleServiceStatus.mutate({
                                                id: service.id,
                                                isActive: !service.isActive
                                            })}
                                            className={cn(
                                                "h-10 w-10",
                                                service.isActive 
                                                    ? 'hover:bg-muted' 
                                                    : 'hover:bg-success/10 text-success'
                                            )}
                                            title={service.isActive ? 'Деактивировать' : 'Активировать'}
                                        >
                                            <Power className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteService.mutate(service.id)}
                                            className="h-10 w-10 hover:bg-destructive/10 hover:text-destructive"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            У вас пока нет услуг. Создайте первую услугу!
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
