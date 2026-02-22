'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';
import { MapPin, Star, Clock } from 'lucide-react';
import { Avatar } from './avatar';
import { Badge } from './badge';

export interface MasterCardProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  description?: string | null;
  workFormat: 'ONLINE' | 'OFFLINE' | 'BOTH';
  address?: string | null;
  rating: number;
  totalReviews: number;
  experienceYears?: number;
  services?: Array<{
    id: string;
    name: string;
    price: number | string;
  }>;
  minPrice?: number;
  onClick?: () => void;
}

const formatWorkFormat = (format: string) => {
  switch (format) {
    case 'ONLINE':
      return 'Онлайн';
    case 'OFFLINE':
      return 'Офлайн';
    case 'BOTH':
      return 'Онлайн и офлайн';
    default:
      return format;
  }
};

const formatPrice = (price: number | string) => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `${num.toLocaleString('ru-RU')} ₽`;
};

const MasterCard = forwardRef<HTMLDivElement, MasterCardProps>(
  (
    {
      className,
      id,
      fullName,
      avatarUrl,
      description,
      workFormat,
      address,
      rating,
      totalReviews,
      experienceYears,
      services,
      minPrice,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (onClick) onClick();
    };

    const minServicePrice =
      minPrice ||
      (services && services.length > 0
        ? Math.min(...services.map((s) => Number(s.price)))
        : undefined);

    return (
      <div
        ref={ref}
        className={cn(
          'group relative flex flex-col',
          'rounded-[40px] bg-surface shadow-card',
          'transition-all duration-200',
          'hover:shadow-xl hover:-translate-y-1',
          'cursor-pointer',
          'overflow-hidden',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Card Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <Avatar
            src={avatarUrl}
            alt={fullName}
            fallback={fullName.charAt(0)}
            size="lg"
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-lg text-foreground truncate">
              {fullName}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{formatWorkFormat(workFormat)}</span>
            </div>
            {address && (
              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                <span className="truncate">{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        )}

        {/* Rating and Stats */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-semibold text-foreground">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({totalReviews} отзывов)
            </span>
          </div>
          {experienceYears && experienceYears > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{experienceYears} лет</span>
            </div>
          )}
        </div>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-1">
              {services.slice(0, 3).map((service) => (
                <Badge key={service.id} variant="secondary">
                  {service.name}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline">+{services.length - 3}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer with Price */}
        <div className="mt-auto flex items-center justify-between px-6 pb-6 pt-4 border-t border-border/50">
          <div className="text-sm text-muted-foreground">
            Услуги от
          </div>
          <div className="font-heading font-bold text-xl text-primary">
            {minServicePrice ? formatPrice(minServicePrice) : '—'}
          </div>
        </div>

        {/* Hover indicator */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 h-1 bg-primary',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        />
      </div>
    );
  }
);
MasterCard.displayName = 'MasterCard';

export { MasterCard };
