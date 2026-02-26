'use client';

import { DayPicker } from 'react-day-picker';
import { ru } from 'react-day-picker/locale';
import { Schedule } from '@/shared/types/api';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';

interface ScheduleCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  schedules: Schedule[];
}

export function ScheduleCalendar({ selectedDate, onSelectDate, schedules }: ScheduleCalendarProps) {
  // s.date from API is full ISO timestamp — slice to "YYYY-MM-DD", parse as local midnight
  const scheduledDates = schedules.map((s) => {
    const [y, m, d] = s.date.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  });

  return (
    <Card className="p-4 w-full lg:w-auto shrink-0">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        locale={ru}
        modifiers={{ hasSchedule: scheduledDates }}
        classNames={{
          root: 'font-sans',
          months: 'relative',
          month_caption: 'flex justify-center items-center mb-4 font-semibold text-sm',
          nav: 'absolute inset-x-0 top-0 flex justify-between',
          button_previous: 'p-1.5 rounded-lg hover:bg-secondary transition-colors',
          button_next: 'p-1.5 rounded-lg hover:bg-secondary transition-colors',
          month_grid: 'w-full border-collapse',
          weekdays: 'flex',
          weekday: 'flex-1 text-center text-xs text-muted-foreground font-medium py-2',
          week: 'flex mt-1',
          day: 'flex-1 flex justify-center',
          day_button: cn(
            'w-9 h-9 flex flex-col items-center justify-center rounded-xl text-sm',
            'hover:bg-secondary transition-colors cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          ),
          selected: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary',
          today: '[&>button]:border-2 [&>button]:border-primary [&>button]:text-primary [&.rdp-selected>button]:text-primary-foreground',
          outside: 'opacity-30',
          disabled: 'opacity-30 cursor-not-allowed',
        }}
        components={{
          DayButton: ({ day, modifiers, className, ...props }) => {
            const hasSchedule = modifiers.hasSchedule;
            const isSelected = modifiers.selected;
            return (
              <button
                {...props}
                className={cn(
                  'w-9 h-9 flex flex-col items-center justify-center rounded-xl text-sm transition-colors',
                  'hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                  modifiers.today && !isSelected && 'border-2 border-primary text-primary font-semibold',
                  modifiers.outside && 'opacity-30',
                  modifiers.disabled && 'opacity-30 cursor-not-allowed',
                )}
              >
                <span className="leading-none">{day.date.getDate()}</span>
                {hasSchedule && (
                  <span
                    className={cn(
                      'block w-1 h-1 rounded-full mt-0.5',
                      isSelected ? 'bg-primary-foreground' : 'bg-primary'
                    )}
                  />
                )}
              </button>
            );
          },
        }}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-primary inline-block" />
          Выбранный день
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md border-2 border-primary inline-block" />
          Сегодня
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          Есть смена
        </div>
      </div>
    </Card>
  );
}
