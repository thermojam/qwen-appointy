'use client';

import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import { CheckCircle, User } from 'lucide-react';

interface ClientStep3Props {
  onSubmit: () => void;
  onBack: () => void;
}

export function ClientStep3({ onSubmit, onBack }: ClientStep3Props) {
  const { client, updateClientData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

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
          <User className="w-5 h-5 text-primary" />
          Основная информация
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">ФИО:</span>
            <p className="font-medium">{client.fullName || '—'}</p>
          </div>
        </div>
      </div>

      {/* Интересы */}
      <div className="p-4 rounded-lg border space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Интересы
        </h3>
        <div className="flex flex-wrap gap-2">
          {client.interests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 bg-secondary rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Согласие с условиями */}
      <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
        <button
          type="button"
          onClick={() => updateClientData({ agreedToTerms: !client.agreedToTerms })}
          className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
            client.agreedToTerms
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border bg-background'
          }`}
        >
          {client.agreedToTerms && <CheckCircle className="w-3 h-3" />}
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
          disabled={!client.agreedToTerms}
        >
          Завершить регистрацию
        </button>
      </div>
    </form>
  );
}
