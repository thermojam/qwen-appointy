'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function AvatarUpload({ value, onChange, className }: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, загрузите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setIsLoading(true);

    // В продакшене здесь будет загрузка на сервер
    // Для MVP используем FileReader для локального предпросмотра
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div
        className={cn(
          'relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed transition-colors',
          isDragging ? 'border-primary bg-secondary' : 'border-border',
          value && 'border-solid border-primary'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Загрузить</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {value ? 'Изменить' : 'Загрузить фото'}
        </Button>
        <span className="text-xs text-muted-foreground">
          PNG, JPG до 5MB
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
