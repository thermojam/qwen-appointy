'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {useRegister} from '@/features/auth/hooks/auth.hooks';
import {Button} from '@/shared/ui/button';
import {Input} from '@/shared/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/shared/ui/card';

export default function SignUpPage() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const register = useRegister();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Роль берётся из query параметра (с главной страницы)
        const role = (searchParams.get('role')?.toUpperCase() as 'MASTER' | 'CLIENT') || 'CLIENT';
        await register.mutateAsync({email, password, role});
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="font-heading text-2xl">Регистрация</CardTitle>
                    <CardDescription>
                        Создайте аккаунт для начала работы
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Пароль
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        {register.isError && (
                            <p className="text-sm text-destructive">
                                {register.error instanceof Error ? register.error.message : 'Ошибка регистрации'}
                            </p>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={register.isPending}
                        >
                            {register.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Уже есть аккаунт?{' '}
                        <Link href="/sign-in" className="text-primary hover:underline">
                            Войти
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
