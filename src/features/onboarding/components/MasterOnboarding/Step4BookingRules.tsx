'use client';

import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import { Button } from '@/shared/ui/button';

interface MasterStep4Props {
  onNext: () => void;
  onBack: () => void;
}

export function MasterStep4({ onNext, onBack }: MasterStep4Props) {
  const { master, updateMasterData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-semibold">Правила бронирования</h2>
        <p className="text-muted-foreground">
          Настройте правила записи и отмены appointments
        </p>
      </div>

      <div className="space-y-6">
        {/* Подтверждение записи */}
        <div className="p-4 rounded-lg border bg-secondary/50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium">Подтверждение записи</h3>
              <p className="text-sm text-muted-foreground">
                Требуется ручное подтверждение каждой записи
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateMasterData({
                  bookingConfirmationRequired: !master.bookingConfirmationRequired,
                })
              }
              className={`w-14 h-8 rounded-full transition-colors relative ${
                master.bookingConfirmationRequired ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform shadow ${
                  master.bookingConfirmationRequired ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {master.bookingConfirmationRequired
              ? 'Клиенты увидят статус "Ожидает подтверждения" после записи'
              : 'Записи будут автоматически подтверждены'}
          </p>
        </div>

        {/* Минимальное время отмены */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Минимальное время отмены (часов) *
          </label>
          <div className="flex gap-2 flex-wrap">
            {[12, 24, 48, 72].map((hours) => (
              <Button
                key={hours}
                type="button"
                variant={master.minCancellationTime === hours ? 'default' : 'outline'}
                onClick={() => updateMasterData({ minCancellationTime: hours })}
              >
                {hours}ч
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Клиенты могут отменить запись не позднее чем за {master.minCancellationTime} часов
          </p>
        </div>

        {/* Максимальный срок бронирования */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Максимальный срок бронирования (дней) *
          </label>
          <div className="flex gap-2 flex-wrap">
            {[7, 14, 30, 60, 90].map((days) => (
              <Button
                key={days}
                type="button"
                variant={master.maxBookingLeadTime === days ? 'default' : 'outline'}
                onClick={() => updateMasterData({ maxBookingLeadTime: days })}
              >
                {days}дн
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Клиенты могут записаться не более чем за {master.maxBookingLeadTime} дней
          </p>
        </div>
      </div>

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
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Далее
        </button>
      </div>
    </form>
  );
}
