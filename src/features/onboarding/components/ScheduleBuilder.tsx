'use client';

import { useState } from 'react';
import { Clock, X, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { ScheduleDay } from '../hooks/useOnboardingStore';

interface ScheduleBuilderProps {
  value: ScheduleDay[];
  onChange: (schedule: ScheduleDay[]) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function ScheduleBuilder({ value, onChange }: ScheduleBuilderProps) {
  const [newDate, setNewDate] = useState('');

  const addDay = () => {
    if (!newDate) return;
    if (value.some((d) => d.date === newDate)) return;
    const sorted = [...value, { date: newDate, startTime: '09:00', endTime: '18:00' }].sort(
      (a, b) => a.date.localeCompare(b.date)
    );
    onChange(sorted);
    setNewDate('');
  };

  const removeDay = (date: string) => {
    onChange(value.filter((d) => d.date !== date));
  };

  const updateTime = (date: string, field: 'startTime' | 'endTime', time: string) => {
    onChange(value.map((d) => (d.date === date ? { ...d, [field]: time } : d)));
  };

  const toggleBreak = (date: string) => {
    onChange(
      value.map((d) => {
        if (d.date !== date) return d;
        if (d.breakStart && d.breakEnd) {
          return { ...d, breakStart: undefined, breakEnd: undefined };
        }
        return { ...d, breakStart: '13:00', breakEnd: '14:00' };
      })
    );
  };

  const updateBreakTime = (date: string, field: 'breakStart' | 'breakEnd', time: string) => {
    onChange(value.map((d) => (d.date === date ? { ...d, [field]: time } : d)));
  };

  return (
    <div className="space-y-4">
      {/* Add date */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="w-48"
          min={new Date().toISOString().slice(0, 10)}
        />
        <Button type="button" variant="outline" size="sm" onClick={addDay} disabled={!newDate}>
          <Plus className="w-4 h-4 mr-1" />
          Добавить день
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Добавьте рабочие дни, выбрав даты выше
        </p>
      )}

      {value.map((day) => (
        <div
          key={day.date}
          className="p-4 rounded-lg border border-primary bg-secondary/50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{formatDate(day.date)}</span>
            <button
              type="button"
              onClick={() => removeDay(day.date)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Work hours */}
          <div className="flex items-center gap-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={day.startTime}
                onChange={(e) => updateTime(day.date, 'startTime', e.target.value)}
                className="w-28"
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="time"
                value={day.endTime}
                onChange={(e) => updateTime(day.date, 'endTime', e.target.value)}
                className="w-28"
              />
            </div>
          </div>

          {/* Break */}
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleBreak(day.date)}
              className={cn(
                'h-8 text-sm',
                day.breakStart && day.breakEnd ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {day.breakStart && day.breakEnd && <X className="w-3 h-3 mr-1" />}
              {day.breakStart && day.breakEnd ? 'Убрать перерыв' : 'Добавить перерыв'}
            </Button>

            {day.breakStart && day.breakEnd && (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={day.breakStart}
                  onChange={(e) => updateBreakTime(day.date, 'breakStart', e.target.value)}
                  className="w-24"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="time"
                  value={day.breakEnd}
                  onChange={(e) => updateBreakTime(day.date, 'breakEnd', e.target.value)}
                  className="w-24"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
