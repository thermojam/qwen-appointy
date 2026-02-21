'use client';

import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Logo } from '@/shared/ui/logo';
import { ThemeToggle } from '@/features/theme-toggle';

interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
}

function FeatureCard({ title, description, features }: FeatureCardProps) {
  return (
    <div className="relative drop-shadow-xl w-full h-64 overflow-hidden rounded-xl">
      <div className="absolute flex flex-col items-start justify-center z-[1] rounded-xl inset-[2px] p-6 bg-[#FAFAFA] dark:bg-[#252525]">
        <h3 className="font-heading text-xl font-bold mb-1 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-foreground">
              <span className="text-primary">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute w-56 h-48 bg-primary/30 blur-[50px] -left-1/2 -top-1/2" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Регистрация</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-6xl font-bold mb-4">
            Онлайн-запись для мастеров
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Платформа для управления услугами, расписанием и записями клиентов
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register?role=master">
              <Button size="lg">Я мастер</Button>
            </Link>
            <Link href="/auth/register?role=client">
              <Button variant="outline" size="lg">Я клиент</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            title="Для мастеров"
            description="Управление услугами и расписанием"
            features={[
              'Создание услуг',
              'Настройка графика работы',
              'Управление записями',
              'Статистика и аналитика',
            ]}
          />

          <FeatureCard
            title="Для клиентов"
            description="Поиск и запись к мастерам"
            features={[
              'Поиск мастеров по услугам',
              'Онлайн-запись 24/7',
              'Отзывы и рейтинги',
              'История записей',
            ]}
          />

          <FeatureCard
            title="Преимущества"
            description="Почему выбирают нас"
            features={[
              'Удобный интерфейс',
              'Автоматические напоминания',
              'Подтверждение записей',
              'Поддержка 24/7',
            ]}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Appointy. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
