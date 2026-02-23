'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';
import { Textarea } from './textarea';
import { Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/ui/toast';

export interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  masterName: string;
}

export function ReviewModal({ open, onOpenChange, onSubmit, masterName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await onSubmit({ rating, comment });
      // Reset form
      setRating(0);
      setComment('');
      setSubmitStatus('success');
      
      // Закрываем модалку через 2 секунды
      setTimeout(() => {
        onOpenChange(false);
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit review:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Оставить отзыв
          </DialogTitle>
          <DialogDescription>
            Поделитесь своим опытом работы с мастером {masterName}
          </DialogDescription>
        </DialogHeader>

        {/* Inline сообщение об успехе/ошибке */}
        {submitStatus === 'success' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">Спасибо за ваш отзыв!</p>
              <p className="text-xs text-green-700">Ваш отзыв поможет мастеру стать лучше</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Что-то пошло не так</p>
              <p className="text-xs text-red-700">Попробуйте ещё раз позже</p>
            </div>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Ваша оценка *
            </label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      'w-10 h-10 transition-all',
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-300'
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && 'Очень плохо 😞'}
                {rating === 2 && 'Плохо 😕'}
                {rating === 3 && 'Нормально 😐'}
                {rating === 4 && 'Хорошо 🙂'}
                {rating === 5 && 'Отлично 😊'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Комментарий (необязательно)
            </label>
            <Textarea
              placeholder="Расскажите подробнее о вашем опыте..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
