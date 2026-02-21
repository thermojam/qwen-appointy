'use client';

import { TagSelector } from '../TagSelector';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

interface ClientStep2Props {
  onNext: () => void;
  onBack: () => void;
}

// Категории интересов для клиентов
const interestCategories: Record<string, string[]> = {
  'Волосы': [
    'Стрижки',
    'Окрашивание',
    'Укладки',
    'Причёски',
    'Лечение волос',
    'Ламинирование',
  ],
  'Ногти': [
    'Маникюр',
    'Педикюр',
    'Наращивание',
    'Дизайн ногтей',
    'SPA-уход',
  ],
  'Визаж': [
    'Макияж',
    'Оформление бровей',
    'Ресницы',
    'Свадебный образ',
  ],
  'Массаж': [
    'Общий массаж',
    'Спортивный массаж',
    'Релакс',
    'Антицеллюлитный',
    'Массаж лица',
  ],
  'Косметология': [
    'Уход за лицом',
    'Пилинги',
    'Чистка',
    'Инъекции',
    'Омоложение',
  ],
  'Тело': [
    'Эпиляция',
    'Шугаринг',
    'Обёртывания',
    'Коррекция фигуры',
  ],
};

export function ClientStep2({ onNext, onBack }: ClientStep2Props) {
  const { client, updateClientData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client.interests.length > 0) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-semibold">Интересы</h2>
        <p className="text-muted-foreground">
          Выберите услуги, которые вас интересуют, чтобы мы могли подобрать подходящих мастеров
        </p>
      </div>

      <div className="space-y-4">
        <TagSelector
          selectedTags={client.interests}
          onChange={(tags) => updateClientData({ interests: tags })}
          categories={interestCategories}
          placeholder="Поиск услуг..."
          allowCustom={true}
          maxTags={15}
        />
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
          disabled={client.interests.length === 0}
        >
          Далее
        </button>
      </div>
    </form>
  );
}
