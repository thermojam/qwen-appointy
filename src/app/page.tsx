'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { Logo } from '@/shared/ui/logo';
import { ThemeToggle } from '@/features/theme-toggle';
import { useAuth, useLogout } from '@/features/auth/hooks/auth.hooks';
import { User, Sparkles, Clock, Heart, LogOut } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
  icon?: React.ReactNode;
}

function FeatureCard({ title, description, features, icon }: FeatureCardProps) {
  return (
    <div className="relative drop-shadow-xl w-full h-72 overflow-hidden rounded-[40px] group transition-transform duration-300 hover:-translate-y-2">
      <div className="absolute flex flex-col items-start justify-center z-[1] rounded-[40px] inset-[2px] p-8 bg-background">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-heading text-2xl font-bold mb-3 text-foreground">{title}</h3>
        <p className="text-base text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-3 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-foreground">
              <span className="text-primary font-bold">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute w-56 h-48 bg-primary/20 blur-[60px] -left-1/2 -top-1/2 group-hover:bg-primary/30 transition-colors duration-300" />
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'CLIENT') {
        router.push('/client');
      } else if (user.role === 'MASTER') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push(user?.role === 'CLIENT' ? '/client' : '/dashboard')}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Кабинет</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выйти</span>
                </Button>
              </div>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" className="gap-2">
                  <User className="w-4 h-4" />
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4">
        {/* Hero Content */}
        <section className="py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Приложение объединяет{' '}
              <span className="text-primary">мастеров</span> и{' '}
              <span className="text-primary">клиентов</span> в одном месте
            </h1>
            
            <div className="space-y-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              <p>
                Маникюр, педикюр, уходовые процедуры — всё доступно в несколько кликов, 
                без звонков, переписок и ожиданий ответа.
              </p>
              <p>
                Выбирайте мастера, смотрите свободные окна, записывайтесь в удобное время 
                и управляйте своими визитами прямо в приложении.
              </p>
              <p className="font-medium text-foreground">
                Пройдите быструю регистрацию, чтобы оформить первую запись и открыть доступ 
                ко всем возможностям Appointy.
                <br />
                <span className="text-primary">Красота должна быть удобной — мы сделали именно так.</span>
              </p>
            </div>

            {/* Role Selection Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Link 
                href="/sign-up?role=client"
                className="group relative w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-colors duration-300" />
                <Button 
                  size="lg" 
                  className="relative h-16 px-10 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                >
                  <Heart className="w-6 h-6 mr-3" />
                  Я клиент
                </Button>
              </Link>
              
              <Link 
                href="/sign-up?role=master"
                className="group relative w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-colors duration-300" />
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="relative h-16 px-10 text-lg rounded-full border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Я мастер
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link href="/sign-in" className="text-primary font-medium hover:underline">
                Войти →
              </Link>
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Heart className="w-7 h-7 text-primary" />}
              title="Для клиентов"
              description="Записывайтесь к мастерам легко и удобно"
              features={[
                'Поиск мастеров по услугам и рейтингу',
                'Онлайн-запись 24/7 без звонков',
                'Просмотр свободных окон в реальном времени',
                'История записей и напоминания',
                'Отзывы и оценки мастеров',
              ]}
            />

            <FeatureCard
              icon={<Sparkles className="w-7 h-7 text-primary" />}
              title="Для мастеров"
              description="Управляйте своим бизнесом эффективно"
              features={[
                'Управление услугами и ценами',
                'Настройка графика работы и перерывов',
                'Автоматическое подтверждение записей',
                'Статистика и аналитика дохода',
                'База клиентов и история визитов',
              ]}
            />

            <FeatureCard
              icon={<Clock className="w-7 h-7 text-primary" />}
              title="Преимущества"
              description="Почему выбирают Appointy"
              features={[
                'Экономия времени до 80%',
                'Автоматические напоминания клиентам',
                'Защита от опозданий и неявок',
                'Удобный интерфейс для всех',
                'Поддержка 24/7',
              ]}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="relative rounded-[40px] bg-primary text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
            <div className="relative z-10 text-center py-16 px-8">
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                Готовы начать?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                Присоединяйтесь к Appointy уже сегодня и оцените все преимущества платформы
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up?role=client">
                  <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full">
                    Начать как клиент
                  </Button>
                </Link>
                <Link href="/sign-up?role=master">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-transparent border-2 border-primary-foreground hover:bg-primary-foreground/10">
                    Начать как мастер
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Appointy. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
