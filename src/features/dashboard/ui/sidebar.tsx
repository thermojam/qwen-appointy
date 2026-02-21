'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { Logo } from '@/shared/ui/logo';
import {
  Home,
  Calendar,
  Briefcase,
  Clock,
  Bell,
  Image as ImageIcon,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Главная', icon: Home },
  { href: '/dashboard/appointments', label: 'Записи', icon: Calendar },
  { href: '/dashboard/services', label: 'Услуги', icon: Briefcase },
  { href: '/dashboard/schedule', label: 'Расписание', icon: Clock },
  { href: '/dashboard/notifications', label: 'Уведомления', icon: Bell },
  { href: '/dashboard/gallery', label: 'Галерея', icon: ImageIcon },
  { href: '/dashboard/reviews', label: 'Отзывы', icon: Star },
  { href: '/dashboard/settings', label: 'Настройки', icon: Settings },
];

interface SidebarProps {
  user?: {
    fullName?: string | null;
    email: string;
    avatar?: string | null;
  };
  onLogout?: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // На мобильных устройствах по умолчанию свёрнут
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-background border shadow-lg md:hidden"
        title={isCollapsed ? 'Открыть меню' : 'Закрыть меню'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full border-r bg-background flex flex-col transition-all duration-300 ease-in-out z-50',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
      {/* Logo & Toggle */}
      <div className={cn('p-6 border-b flex items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
        {!isCollapsed && (
          <Link href="/dashboard">
            <Logo />
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors hidden md:block"
          title={isCollapsed ? 'Развернуть' : 'Свернуть'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isCollapsed ? 'justify-center px-2' : '',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn('w-5 h-5', isCollapsed ? '' : 'flex-shrink-0')} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t">
        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center px-2' : 'px-3 py-2')}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-primary">
                {user?.fullName?.charAt(0) || user?.email.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.fullName || user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.fullName ? user.email.split('@')[0] : 'Мастер'}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                title="Выйти"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </>
          )}
          {isCollapsed && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
