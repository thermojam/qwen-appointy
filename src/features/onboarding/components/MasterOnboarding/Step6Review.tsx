'use client';

import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import { CheckCircle, MapPin, Monitor, Clock, Calendar } from 'lucide-react';

interface MasterStep6Props {
  onSubmit: () => void;
  onBack: () => void;
}

const dayLabels: Record<string, string> = {
  MONDAY: 'Пн',
  TUESDAY: 'Вт',
  WEDNESDAY: 'Ср',
  THURSDAY: 'Чт',
  FRIDAY: 'Пт',
  SATURDAY: 'Сб',
  SUNDAY: 'Вс',
};

export function MasterStep6({ onSubmit, onBack }: MasterStep6Props) {
  const { master, updateMasterData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const activeSchedule = master.schedule.filter((day) => day.isActive);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-semibold">Проверка данных</h2>
        <p className="text-muted-foreground">
          Проверьте информацию перед завершением регистрации
        </p>
      </div>

      {/* Профиль */}
      <div className="p-4 rounded-lg border space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Основная информация
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">ФИО:</span>
            <p className="font-medium">{master.fullName || '—'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Опыт:</span>
            <p className="font-medium">{master.experienceYears} лет</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Формат работы:</span>
            <p className="font-medium flex items-center gap-2">
              {master.workFormat === 'ONLINE' && <Monitor className="w-4 h-4" />}
              {master.workFormat === 'OFFLINE' && <MapPin className="w-4 h-4" />}
              {master.workFormat === 'BOTH' && (
                <>
                  <Monitor className="w-4 h-4" />
                  <MapPin className="w-4 h-4" />
                </>
              )}
              {master.workFormat === 'ONLINE' && 'Онлайн'}
              {master.workFormat === 'OFFLINE' && 'Офлайн'}
              {master.workFormat === 'BOTH' && 'Онлайн + Офлайн'}
            </p>
          </div>
          {(master.workFormat === 'OFFLINE' || master.workFormat === 'BOTH') && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Адрес:</span>
              <p className="font-medium">{master.address || '—'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Услуги */}
      <div className="p-4 rounded-lg border space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Услуги
        </h3>
        <div className="flex flex-wrap gap-2">
          {master.serviceIds.slice(0, 10).map((service) => (
            <span
              key={service}
              className="px-3 py-1 bg-secondary rounded-full text-sm"
            >
              {service}
            </span>
          ))}
          {master.serviceIds.length > 10 && (
            <span className="px-3 py-1 bg-secondary rounded-full text-sm">
              +{master.serviceIds.length - 10} ещё
            </span>
          )}
        </div>
      </div>

      {/* Правила */}
      <div className="p-4 rounded-lg border space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Правила бронирования
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Подтверждение:</span>
            <p className="font-medium">
              {master.bookingConfirmationRequired ? 'Требуется' : 'Автоматически'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Отмена за:</span>
            <p className="font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {master.minCancellationTime}ч
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Запись до:</span>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {master.maxBookingLeadTime} дней
            </p>
          </div>
        </div>
      </div>

      {/* График */}
      <div className="p-4 rounded-lg border space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          График работы
        </h3>
        <div className="flex flex-wrap gap-2">
          {activeSchedule.map((day) => (
            <span
              key={day.dayOfWeek}
              className="px-3 py-1 bg-secondary rounded-full text-sm"
            >
              {dayLabels[day.dayOfWeek]}: {day.startTime}–{day.endTime}
            </span>
          ))}
          {activeSchedule.length === 0 && (
            <span className="text-muted-foreground text-sm">Нет активных дней</span>
          )}
        </div>
      </div>

      {/* Согласие с условиями */}
      <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
        <button
          type="button"
          onClick={() => updateMasterData({ agreedToTerms: !master.agreedToTerms })}
          className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
            master.agreedToTerms
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border bg-background'
          }`}
        >
          {master.agreedToTerms && <CheckCircle className="w-3 h-3" />}
        </button>
        <label className="text-sm cursor-pointer select-none">
          Я подтверждаю правильность указанной информации и соглашаюсь с{' '}
          <a href="#" className="text-primary hover:underline">
            условиями использования
          </a>{' '}
          и{' '}
          <a href="#" className="text-primary hover:underline">
            политикой конфиденциальности
          </a>
        </label>
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
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={!master.agreedToTerms}
        >
          Завершить регистрацию
        </button>
      </div>
    </form>
  );
}
