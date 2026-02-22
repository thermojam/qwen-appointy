'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Search, X } from 'lucide-react';
import { Button } from './button';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  onSearch?: (query: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onClear, onSearch, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
      if (onClear) onClear();
      if (props.onChange) {
        props.onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(String(props.value || ''));
      }
    };

    return (
      <div
        className={cn(
          'relative flex items-center w-full',
          'rounded-[8px] border border-input bg-background',
          'transition-all duration-200',
          isFocused && 'ring-2 ring-primary ring-offset-2',
          className
        )}
      >
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          className={cn(
            'flex w-full h-[52px] rounded-[8px]',
            'bg-transparent py-0 pr-12 pl-12 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {props.value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 h-8 w-8 rounded-full hover:bg-secondary"
            onClick={handleClear}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);
SearchBar.displayName = 'SearchBar';

export { SearchBar };
