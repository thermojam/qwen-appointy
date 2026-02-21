'use client';

import { Textarea } from '@/shared/ui/textarea';
import { TagSelector } from '../TagSelector';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

interface MasterStep3Props {
  onNext: () => void;
  onBack: () => void;
}

// Доступные категории услуг
const serviceCategories: Record<string, string[]> = {
  'Волосы': [
    'Стрижка женская',
    'Стрижка мужская',
    'Стрижка детская',
    'Окрашивание',
    'Мелирование',
    'Укладка',
    'Причёски',
    'Локоны',
    'Плетение кос',
    'Ламинирование',
    'Выпрямление',
  ],
  'Ногтевой сервис': [
    'Маникюр',
    'Педикюр',
    'Наращивание ногтей',
    'Коррекция ногтей',
    'Покрытие гель-лак',
    'Дизайн ногтей',
    'SPA-уход',
  ],
  'Визаж': [
    'Дневной макияж',
    'Вечерний макияж',
    'Свадебный макияж',
    'Ретушь',
    'Стрелки',
    'Оформление бровей',
    'Долговременная укладка бровей',
  ],
  'Массаж': [
    'Общий массаж',
    'Спортивный массаж',
    'Релакс-массаж',
    'Антицеллюлитный массаж',
    'Лимфодренажный массаж',
    'Массаж лица',
    'Массаж спины',
  ],
  'Косметология': [
    'Чистка лица',
    'Пилинг',
    'Мезотерапия',
    'Биоревитализация',
    'Массаж лица',
    'Уход за кожей',
  ],
};

export function MasterStep3({ onNext, onBack }: MasterStep3Props) {
  const { master, updateMasterData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (master.serviceIds.length > 0) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-semibold">О себе и услуги</h2>
        <p className="text-muted-foreground">
          Расскажите о своём опыте и выберите услуги, которые вы предоставляете
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            О себе
          </label>
          <Textarea
            id="description"
            value={master.description}
            onChange={(e) => updateMasterData({ description: e.target.value })}
            placeholder="Расскажите о вашем опыте, образовании, подходах к работе..."
            rows={5}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {master.description.length}/1000
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Услуги *
          </label>
          <TagSelector
            selectedTags={master.serviceIds}
            onChange={(tags) => updateMasterData({ serviceIds: tags })}
            categories={serviceCategories}
            placeholder="Поиск услуг..."
            allowCustom={true}
            maxTags={20}
          />
          <p className="text-xs text-muted-foreground">
            Выберите хотя бы одну услугу для продолжения
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
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={master.serviceIds.length === 0}
        >
          Далее
        </button>
      </div>
    </form>
  );
}
