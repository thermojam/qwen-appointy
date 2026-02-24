'use client';

import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Star, MapPin, Clock } from 'lucide-react';
import type { MasterProfile } from '@/shared/types/api';

interface FavoriteCardProps {
  master: MasterProfile;
  onClick?: () => void;
}

/**
 * Карточка мастера в списке избранных
 */
export const FavoriteCard = ({ master, onClick }: FavoriteCardProps) => {
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

  const minPrice = master.services?.length
    ? Math.min(...master.services.map((s) => Number(s.price)))
    : null;

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar
            src={master.avatarUrl}
            alt={master.fullName}
            fallback={master.fullName.charAt(0)}
            size="lg"
            className="flex-shrink-0"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading font-semibold text-lg truncate">
                  {master.fullName}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {formatWorkFormat(master.workFormat)}
                  </span>
                  {master.experienceYears > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {master.experienceYears} лет
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 bg-warning-background px-3 py-1 rounded-full flex-shrink-0">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-semibold text-sm">{master.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({master.totalReviews})
                </span>
              </div>
            </div>

            {/* Description */}
            {master.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {master.description}
              </p>
            )}

            {/* Services & Price */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline">
                {master.services?.length || 0} услуг
              </Badge>
              {minPrice !== null && (
                <Badge variant="secondary">
                  от {minPrice.toLocaleString('ru-RU')} ₽
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
