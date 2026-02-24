'use client';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import { MapPin, Monitor, Home, Car } from 'lucide-react';
import { OfflineMode } from '@prisma/client';

interface MasterStep2Props {
  onNext: () => void;
  onBack: () => void;
}

export function MasterStep2({ onNext, onBack }: MasterStep2Props) {
  const { master, updateMasterData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация: для OFFLINE + AT_MY_PLACE нужен адрес
    if (master.workFormat === 'OFFLINE' && master.offlineMode === 'AT_MY_PLACE' && !master.address) {
      return;
    }
    // Валидация: для BOTH нужен адрес
    if (master.workFormat === 'BOTH' && !master.address) {
      return;
    }

    onNext();
  };

  const canProceed =
    master.workFormat === 'ONLINE' ||
    (master.workFormat === 'OFFLINE' && master.offlineMode === 'AT_CLIENT_PLACE') ||
    (master.workFormat === 'OFFLINE' && master.offlineMode === 'AT_MY_PLACE' && master.address) ||
    (master.workFormat === 'BOTH' && master.address);

  // Обработчик выбора оффлайн-режима
  const handleOfflineModeChange = (mode: OfflineMode) => {
    updateMasterData({ offlineMode: mode });
    // Если переключили на выезд к клиенту, можно очистить адрес (опционально)
    if (mode === 'AT_CLIENT_PLACE') {
      updateMasterData({ address: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-semibold">Формат работы</h2>
        <p className="text-muted-foreground">
          Выберите как вы будете принимать клиентов
        </p>
      </div>

      {/* Выбор формата */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => updateMasterData({ workFormat: 'ONLINE' })}
          className={cn(
            'p-4 rounded-lg border-2 transition-colors text-center',
            master.workFormat === 'ONLINE'
              ? 'border-primary bg-secondary'
              : 'border-border hover:border-primary/50'
          )}
        >
          <Monitor className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Онлайн</p>
        </button>

        <button
          type="button"
          onClick={() => updateMasterData({ workFormat: 'OFFLINE' })}
          className={cn(
            'p-4 rounded-lg border-2 transition-colors text-center',
            master.workFormat === 'OFFLINE'
              ? 'border-primary bg-secondary'
              : 'border-border hover:border-primary/50'
          )}
        >
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Офлайн</p>
        </button>

        <button
          type="button"
          onClick={() => updateMasterData({ workFormat: 'BOTH' })}
          className={cn(
            'p-4 rounded-lg border-2 transition-colors text-center',
            master.workFormat === 'BOTH'
              ? 'border-primary bg-secondary'
              : 'border-border hover:border-primary/50'
          )}
        >
          <div className="flex justify-center gap-2 mb-2">
            <Monitor className="w-6 h-6" />
            <MapPin className="w-6 h-6" />
          </div>
          <p className="font-medium">Оба формата</p>
        </button>
      </div>

      {/* Выбор режима для оффлайна */}
      {master.workFormat === 'OFFLINE' && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Где будете принимать клиентов?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOfflineModeChange('AT_MY_PLACE')}
              className={cn(
                'p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3',
                master.offlineMode === 'AT_MY_PLACE'
                  ? 'border-primary bg-secondary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Home className={cn(
                'w-6 h-6 flex-shrink-0',
                master.offlineMode === 'AT_MY_PLACE' ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div>
                <p className="font-medium">На своём месте</p>
                <p className="text-xs text-muted-foreground">Клиенты приходят к вам</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleOfflineModeChange('AT_CLIENT_PLACE')}
              className={cn(
                'p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3',
                master.offlineMode === 'AT_CLIENT_PLACE'
                  ? 'border-primary bg-secondary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Car className={cn(
                'w-6 h-6 flex-shrink-0',
                master.offlineMode === 'AT_CLIENT_PLACE' ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div>
                <p className="font-medium">Выезд к клиенту</p>
                <p className="text-xs text-muted-foreground">Выезжаете на дом</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Адрес для оффлайна */}
      {(master.workFormat === 'OFFLINE' && master.offlineMode === 'AT_MY_PLACE') || 
       (master.workFormat === 'BOTH') ? (
        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Адрес приёма *
          </label>
          <Input
            id="address"
            value={master.address}
            onChange={(e) => updateMasterData({ address: e.target.value })}
            placeholder="г. Москва, ул. Примерная, д. 10"
            required
          />
          <p className="text-xs text-muted-foreground">
            Укажите полный адрес для отображения на карте
          </p>
        </div>
      ) : null}

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
          disabled={!canProceed}
        >
          Далее
        </button>
      </div>
    </form>
  );
}
