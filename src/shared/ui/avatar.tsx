'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const avatarSizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-base',
  xl: 'h-24 w-24 text-lg',
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const showFallback = !src;

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          avatarSizes[size],
          className
        )}
        {...props}
      >
        {showFallback ? (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center',
              'bg-secondary font-semibold text-secondary-foreground'
            )}
          >
            {fallback || '?'}
          </div>
        ) : (
          <img
            src={src || ''}
            alt={alt || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        )}
        {!showFallback && (
          <div
            className={cn(
              'absolute inset-0 hidden h-full w-full items-center justify-center',
              'bg-secondary font-semibold text-secondary-foreground'
            )}
          >
            {fallback || '?'}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
