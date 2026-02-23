'use client';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import { MapPin, Monitor } from 'lucide-react';

interface MasterStep2Props {
  onNext: () => void;
  onBack: () => void;
}

export function MasterStep2({ onNext, onBack }: MasterStep2Props) {
  const { master, updateMasterData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация: для OFFLINE и BOTH нужен адрес
    if ((master.workFormat === 'OFFLINE' || master.workFormat === 'BOTH') && !master.address) {
      return;
    }
    
    onNext();
  };

  const canProceed =
    master.workFormat === 'ONLINE' ||
    (master.workFormat === 'OFFLINE' && master.address) ||
    (master.workFormat === 'BOTH' && master.address);

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

      {/* Адрес для офлайн */}
      {(master.workFormat === 'OFFLINE' || master.workFormat === 'BOTH') && (
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
      )}

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
