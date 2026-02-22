'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export interface DateTimePickerProps {
  selectedDate?: Date | null;
  selectedTime?: string | null;
  availableSlots?: string[];
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DateTimePicker({
  selectedDate,
  selectedTime,
  availableSlots = [],
  onDateSelect,
  onTimeSelect,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [viewDate, setViewDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: (Date | null)[] = [];
    
    // Add padding days for previous month
    const startDayOfWeek = firstDay.getDay();
    const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    for (let i = 0; i < paddingDays; i++) {
      days.push(null);
    }
    
    // Add current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [viewDate]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const isSlotAvailable = (time: string) => {
    return availableSlots.includes(time);
  };

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div className="p-4 border rounded-xl">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold">
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-muted-foreground font-medium py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const disabled = isDateDisabled(day);
            const selected = isSelectedDate(day);
            const today = isToday(day);

            return (
              <Button
                key={day.toISOString()}
                variant={selected ? 'default' : 'ghost'}
                size="sm"
                disabled={disabled}
                onClick={() => !disabled && onDateSelect?.(day)}
                className={cn(
                  'h-10 w-10 p-0',
                  today && !selected && 'border border-primary'
                )}
              >
                {day.getDate()}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="p-4 border rounded-xl">
          <h4 className="font-semibold mb-3">Доступное время</h4>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.length > 0 ? (
              availableSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  size="sm"
                  disabled={!isSlotAvailable(time)}
                  onClick={() => onTimeSelect?.(time)}
                  className={cn(
                    'h-10',
                    !isSlotAvailable(time) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {formatTime(time)}
                </Button>
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground py-4">
                Нет доступных слотов
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
