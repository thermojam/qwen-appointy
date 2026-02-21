'use client';

import { useMemo } from 'react';
import { Clock, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { DayOfWeek } from '@prisma/client';

interface ScheduleDay {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
}

interface ScheduleBuilderProps {
  value: ScheduleDay[];
  onChange: (schedule: ScheduleDay[]) => void;
}

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: 'Понедельник',
  TUESDAY: 'Вторник',
  WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг',
  FRIDAY: 'Пятница',
  SATURDAY: 'Суббота',
  SUNDAY: 'Воскресенье',
};

const dayOrder: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export function ScheduleBuilder({ value, onChange }: ScheduleBuilderProps) {
  const sortedSchedule = useMemo(() => {
    return [...value].sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));
  }, [value]);

  const toggleDay = (dayOfWeek: DayOfWeek) => {
    onChange(
      value.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, isActive: !day.isActive } : day
      )
    );
  };

  const updateTime = (dayOfWeek: DayOfWeek, field: keyof ScheduleDay, time: string) => {
    onChange(
      value.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: time } : day
      )
    );
  };

  const toggleBreak = (dayOfWeek: DayOfWeek) => {
    onChange(
      value.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        
        if (day.breakStart && day.breakEnd) {
          return { ...day, breakStart: '', breakEnd: '' };
        }
        return { ...day, breakStart: '13:00', breakEnd: '14:00' };
      })
    );
  };

  const updateBreakTime = (dayOfWeek: DayOfWeek, field: 'breakStart' | 'breakEnd', time: string) => {
    onChange(
      value.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: time } : day
      )
    );
  };

  return (
    <div className="space-y-3">
      {sortedSchedule.map((day) => (
        <div
          key={day.dayOfWeek}
          className={cn(
            'p-4 rounded-lg border transition-colors',
            day.isActive ? 'border-primary bg-secondary/50' : 'border-border bg-muted/30'
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleDay(day.dayOfWeek)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  day.isActive ? 'bg-primary' : 'bg-secondary'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    day.isActive ? 'right-1' : 'left-1'
                  )}
                />
              </button>
              <span className={cn('font-medium', !day.isActive && 'text-muted-foreground')}>
                {dayLabels[day.dayOfWeek]}
              </span>
            </div>
            <span className={cn('text-sm', !day.isActive && 'text-muted-foreground')}>
              {day.isActive ? (
                `${day.startTime} - ${day.endTime}${day.breakStart ? ` (перерыв ${day.breakStart}-${day.breakEnd})` : ''}`
              ) : (
                'Выходной'
              )}
            </span>
          </div>

          {day.isActive && (
            <div className="space-y-3 pl-15">
              {/* Рабочее время */}
              <div className="flex items-center gap-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateTime(day.dayOfWeek, 'startTime', e.target.value)}
                    className="w-28"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateTime(day.dayOfWeek, 'endTime', e.target.value)}
                    className="w-28"
                  />
                </div>
              </div>

              {/* Перерыв */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBreak(day.dayOfWeek)}
                  className={cn(
                    'h-8 text-sm',
                    (day.breakStart && day.breakEnd) ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {(day.breakStart && day.breakEnd) && <X className="w-3 h-3 mr-1" />}
                  {day.breakStart && day.breakEnd ? 'Убрать перерыв' : 'Добавить перерыв'}
                </Button>

                {day.breakStart && day.breakEnd && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={day.breakStart}
                      onChange={(e) => updateBreakTime(day.dayOfWeek, 'breakStart', e.target.value)}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">—</span>
                    <Input
                      type="time"
                      value={day.breakEnd}
                      onChange={(e) => updateBreakTime(day.dayOfWeek, 'breakEnd', e.target.value)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
