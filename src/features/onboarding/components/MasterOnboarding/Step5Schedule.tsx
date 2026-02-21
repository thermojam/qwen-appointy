'use client';

import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import { ScheduleBuilder } from '../ScheduleBuilder';
import type { ScheduleDay } from '../../hooks/useOnboardingStore';

interface MasterStep5Props {
  onNext: () => void;
  onBack: () => void;
}

export function MasterStep5({ onNext, onBack }: MasterStep5Props) {
  const { master, updateMasterSchedule } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleScheduleChange = (schedule: ScheduleDay[]) => {
    updateMasterSchedule(schedule);
  };

  const activeDays = master.schedule.filter((day) => day.isActive).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-semibold">График работы</h2>
        <p className="text-muted-foreground">
          Настройте ваши рабочие дни и время приёма
        </p>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Активных дней:</span> {activeDays} из 7
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Включите дни, когда вы готовы принимать клиентов
        </p>
      </div>

      <ScheduleBuilder
        value={master.schedule}
        onChange={handleScheduleChange}
      />

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
        >
          Назад
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={activeDays === 0}
        >
          Далее
        </button>
      </div>
    </form>
  );
}
