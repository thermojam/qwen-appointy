'use client';

import { Input } from '@/shared/ui/input';
import { AvatarUpload } from '../AvatarUpload';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

interface MasterStep1Props {
  onNext: () => void;
}

export function MasterStep1({ onNext }: MasterStep1Props) {
  const { master, updateMasterData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-semibold">Базовая информация</h2>
        <p className="text-muted-foreground">
          Расскажите немного о себе для начала работы
        </p>
      </div>

      <AvatarUpload
        value={master.avatarUrl}
        onChange={(url) => updateMasterData({ avatarUrl: url })}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            ФИО *
          </label>
          <Input
            id="fullName"
            value={master.fullName}
            onChange={(e) => updateMasterData({ fullName: e.target.value })}
            placeholder="Иванова Мария Ивановна"
            required
            minLength={2}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="experienceYears" className="text-sm font-medium">
            Опыт работы (лет) *
          </label>
          <Input
            id="experienceYears"
            type="number"
            min={0}
            max={50}
            value={master.experienceYears}
            onChange={(e) =>
              updateMasterData({ experienceYears: parseInt(e.target.value) || 0 })
            }
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={!master.fullName || master.experienceYears < 0}
        >
          Далее
        </button>
      </div>
    </form>
  );
}
