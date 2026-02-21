'use client';

import { useState, useMemo } from 'react';
import { X, Search, Tag } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags?: string[];
  categories?: Record<string, string[]>;
  placeholder?: string;
  allowCustom?: boolean;
  maxTags?: number;
}

export function TagSelector({
  selectedTags,
  onChange,
  availableTags = [],
  categories,
  placeholder = 'Поиск...',
  allowCustom = true,
  maxTags,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Все доступные теги (из категорий или плоского списка)
  const allTags = useMemo(() => {
    if (categories) {
      return Object.values(categories).flat();
    }
    return availableTags;
  }, [categories, availableTags]);

  // Фильтрация тегов по поиску
  const filteredTags = useMemo(() => {
    let tags = allTags;

    if (activeCategory && categories) {
      tags = categories[activeCategory] || [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tags = tags.filter((tag) => tag.toLowerCase().includes(query));
    }

    return tags;
  }, [allTags, categories, activeCategory, searchQuery]);

  // Категории для отображения
  const categoryList = categories ? Object.keys(categories) : [];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      if (maxTags && selectedTags.length >= maxTags) {
        return;
      }
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = searchQuery.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      if (maxTags && selectedTags.length >= maxTags) {
        return;
      }
      onChange([...selectedTags, trimmed]);
      setSearchQuery('');
    }
  };

  const isCustomTag = searchQuery.trim() && !allTags.includes(searchQuery.trim());

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isCustomTag && allowCustom) {
              e.preventDefault();
              handleAddCustomTag();
            }
          }}
        />
        {isCustomTag && allowCustom && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
            onClick={handleAddCustomTag}
          >
            Добавить
          </Button>
        )}
      </div>

      {/* Категории */}
      {categoryList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            Все
          </Button>
          {categoryList.map((category) => (
            <Button
              key={category}
              type="button"
              variant={activeCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Выбранные теги */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag, index) => (
            <span
              key={`${tag}-selected-${index}`}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleToggleTag(tag)}
                className="hover:bg-primary-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Доступные теги */}
      <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-secondary rounded-lg">
        {filteredTags.length > 0 ? (
          filteredTags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag);
            const uniqueKey = `${tag}-${index}`;
            return (
              <button
                key={uniqueKey}
                type="button"
                onClick={() => handleToggleTag(tag)}
                disabled={isSelected ? false : maxTags ? selectedTags.length >= maxTags : false}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-primary/10',
                  maxTags && selectedTags.length >= maxTags && !isSelected && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            );
          })
        ) : (
          <p className="text-muted-foreground text-sm w-full text-center py-4">
            {searchQuery ? 'Ничего не найдено' : 'Нет доступных тегов'}
          </p>
        )}
      </div>

      {maxTags && (
        <p className="text-xs text-muted-foreground text-right">
          Выбрано: {selectedTags.length} из {maxTags}
        </p>
      )}
    </div>
  );
}
