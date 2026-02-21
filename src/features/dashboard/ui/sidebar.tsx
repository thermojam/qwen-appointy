'use client';

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
  LogOut
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

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r bg-background flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard">
          <Logo />
        </Link>
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
                isActive
                  ? 'bg-[#F1F5F9] text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
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
        </div>
      </div>
    </aside>
  );
}
