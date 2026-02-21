'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { Service, CreateServiceInput } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useRouter } from 'next/navigation';

export default function ServicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newService, setNewService] = useState<CreateServiceInput>({
    name: '',
    description: '',
    duration: 60,
    price: 0,
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.services.getAll(),
  });

  const createService = useMutation({
    mutationFn: (data: CreateServiceInput) => api.services.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsCreating(false);
      setNewService({ name: '', description: '', duration: 60, price: 0 });
    },
  });

  const deleteService = useMutation({
    mutationFn: (id: string) => api.services.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createService.mutateAsync(newService);
  };

  return (
    <div className="min-h-screen bg-background">
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
      <main className="container mx-auto px-4 py-8">
        {/* Create Service Form */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Новая услуга</CardTitle>
              <CardDescription>
                Заполните информацию об услуге
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
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
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
                      value={newService.price}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
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
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({ ...newService, description: e.target.value })
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
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        duration: parseInt(e.target.value) || 60,
                      })
                    }
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createService.isPending}
                  >
                    {createService.isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreating(false)}
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
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-2xl font-bold">{service.price} ₽</p>
                      <p className="text-sm text-muted-foreground">
                        {service.duration} мин
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        service.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {service.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Edit functionality
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteService.mutate(service.id)}
                    >
                      Удалить
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
