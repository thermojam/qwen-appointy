'use client';

import { CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';

export function ScheduleDateNotSelected() {
  return (
    <Card className="w-full h-full min-h-[400px]">
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg mb-1">Выберите дату</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Выберите дату в календаре чтобы настроить расписание
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
