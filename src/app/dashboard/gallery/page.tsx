'use client';

import {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {api} from '@/shared/api/client';
import type {PortfolioWork} from '@/shared/types/api';
import {Sidebar} from '@/features/dashboard/ui/sidebar';
import {useCurrentUser} from '@/features/auth/hooks/auth.hooks';
import {Card, CardContent} from '@/shared/ui/card';
import {Button} from '@/shared/ui/button';
import {Input} from '@/shared/ui/input';
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    Upload,
    X,
    Loader2,
} from 'lucide-react';
import {cn} from '@/shared/lib/utils';

export default function GalleryPage() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [selectedImage, setSelectedImage] = useState<PortfolioWork | null>(null);

    const [newImage, setNewImage] = useState({
        imageUrl: '',
        title: '',
        description: '',
    });

    const currentUserQuery = useCurrentUser();
    const currentUser = currentUserQuery.data;

    const {data: portfolio, isLoading} = useQuery({
        queryKey: ['portfolio'],
        queryFn: () => api.portfolio.getAll(),
        enabled: !!currentUser,
    });

    const createPortfolio = useMutation({
        mutationFn: (data: typeof newImage) =>
            api.portfolio.create({
                imageUrl: data.imageUrl,
                title: data.title || undefined,
                description: data.description || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['portfolio']});
            setIsAdding(false);
            setNewImage({imageUrl: '', title: '', description: ''});
        },
    });

    const deletePortfolio = useMutation({
        mutationFn: (id: string) => api.portfolio.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['portfolio']});
            setSelectedImage(null);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImage.imageUrl) return;
        await createPortfolio.mutateAsync(newImage);
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-3xl font-bold mb-2">Галерея</h1>
                            <p className="text-muted-foreground">
                                Портфолио ваших работ
                            </p>
                        </div>
                        <Button onClick={() => setIsAdding(!isAdding)}>
                            {isAdding ? (
                                <>
                                    <X className="w-4 h-4 mr-2"/>
                                    Отмена
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2"/>
                                    Добавить работу
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Add Image Form */}
                {isAdding && (
                    <Card className="mb-8 rounded-3xl">
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="imageUrl" className="text-sm font-medium">
                                        URL изображения
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="imageUrl"
                                            value={newImage.imageUrl}
                                            onChange={(e) =>
                                                setNewImage({...newImage, imageUrl: e.target.value})
                                            }
                                            placeholder="https://example.com/image.jpg"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                // In a real app, this would open a file uploader
                                                const url = prompt('Введите URL изображения:');
                                                if (url) {
                                                    setNewImage({...newImage, imageUrl: url});
                                                }
                                            }}
                                        >
                                            <Upload className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium">
                                        Название (опционально)
                                    </label>
                                    <Input
                                        id="title"
                                        value={newImage.title}
                                        onChange={(e) =>
                                            setNewImage({...newImage, title: e.target.value})
                                        }
                                        placeholder="Например: Стрижка каре"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium">
                                        Описание (опционально)
                                    </label>
                                    <textarea
                                        id="description"
                                        value={newImage.description}
                                        onChange={(e) =>
                                            setNewImage({...newImage, description: e.target.value})
                                        }
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none"
                                        placeholder="Опишите работу..."
                                    />
                                </div>

                                {/* Preview */}
                                {newImage.imageUrl && (
                                    <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video">
                                        <img
                                            src={newImage.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        disabled={createPortfolio.isPending || !newImage.imageUrl}
                                    >
                                        {createPortfolio.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                                Сохранение...
                                            </>
                                        ) : (
                                            'Добавить'
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setNewImage({imageUrl: '', title: '', description: ''});
                                        }}
                                    >
                                        Отмена
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Gallery Grid */}
                {isLoading ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Загрузка...
                        </CardContent>
                    </Card>
                ) : portfolio && portfolio.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {portfolio.map((item) => (
                            <Card
                                key={item.id}
                                className={cn(
                                    'group overflow-hidden rounded-3xl border-border/50 card-hover cursor-pointer',
                                    selectedImage?.id === item.id && 'ring-2 ring-primary'
                                )}
                                onClick={() => setSelectedImage(item)}
                            >
                                <div className="aspect-square overflow-hidden bg-secondary">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title || 'Portfolio work'}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                                {(item.title || item.description) && (
                                    <CardContent className="p-4">
                                        {item.title && (
                                            <h3 className="font-semibold text-sm mb-1 truncate">
                                                {item.title}
                                            </h3>
                                        )}
                                        {item.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50"/>
                            <p className="text-muted-foreground mb-4">
                                В галерее пока нет работ
                            </p>
                            <Button onClick={() => setIsAdding(true)}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Добавить первую работу
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Image Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div
                            className="relative max-w-4xl w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                            >
                                <X className="w-8 h-8"/>
                            </button>

                            {/* Image */}
                            <div className="rounded-2xl overflow-hidden bg-white">
                                <img
                                    src={selectedImage.imageUrl}
                                    alt={selectedImage.title || 'Portfolio work'}
                                    className="w-full h-auto max-h-[70vh] object-contain"
                                />
                            </div>

                            {/* Info & Actions */}
                            {(selectedImage.title || selectedImage.description) && (
                                <div className="mt-4 bg-background rounded-2xl p-6">
                                    {selectedImage.title && (
                                        <h3 className="font-heading text-xl font-bold mb-2">
                                            {selectedImage.title}
                                        </h3>
                                    )}
                                    {selectedImage.description && (
                                        <p className="text-muted-foreground">
                                            {selectedImage.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-4 flex justify-end gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => deletePortfolio.mutate(selectedImage.id)}
                                    disabled={deletePortfolio.isPending}
                                >
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    Удалить
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedImage(null)}
                                >
                                    Закрыть
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
