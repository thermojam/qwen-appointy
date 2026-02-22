'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Badge } from './badge';
import { DateTimePicker } from './date-time-picker';
import { Check, Clock, Calendar, User, FileText } from 'lucide-react';
import type { Service } from '@/shared/types/api';

export interface BookingWizardProps {
  masterId: string;
  masterName: string;
  services: Service[];
  availableSlots?: string[];
  onSubmit?: (data: BookingData) => void;
  onCancel?: () => void;
}

export interface BookingData {
  masterId: string;
  serviceId: string;
  dateTime: string;
  comment?: string;
}

type Step = 'service' | 'datetime' | 'confirm' | 'success';

export function BookingWizard({
  masterId,
  masterName,
  services,
  availableSlots = [],
  onSubmit,
  onCancel,
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'service', label: 'Услуга', icon: <FileText className="w-4 h-4" /> },
    { key: 'datetime', label: 'Дата и время', icon: <Calendar className="w-4 h-4" /> },
    { key: 'confirm', label: 'Подтверждение', icon: <Check className="w-4 h-4" /> },
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (currentStep === 'service' && selectedServiceId) {
      setCurrentStep('datetime');
    } else if (currentStep === 'datetime' && selectedDate && selectedTime) {
      setCurrentStep('confirm');
    } else if (currentStep === 'confirm') {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === 'datetime') {
      setCurrentStep('service');
    } else if (currentStep === 'confirm') {
      setCurrentStep('datetime');
    }
  };

  const handleSubmit = () => {
    if (selectedServiceId && selectedDate && selectedTime && onSubmit) {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      onSubmit({
        masterId,
        serviceId: selectedServiceId,
        dateTime: dateTime.toISOString(),
        comment: comment || undefined,
      });

      setCurrentStep('success');
    }
  };

  const canProceed = () => {
    if (currentStep === 'service') return !!selectedServiceId;
    if (currentStep === 'datetime') return !!selectedDate && !!selectedTime;
    if (currentStep === 'confirm') return true;
    return false;
  };

  const getDateTimeString = () => {
    if (!selectedDate || !selectedTime) return '';
    const date = selectedDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `${date} в ${selectedTime}`;
  };

  if (currentStep === 'success') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success-background flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">
              Запись создана!
            </h3>
            <p className="text-muted-foreground">
              Вы записаны к {masterName}
            </p>
            {selectedService && (
              <p className="text-sm text-muted-foreground mt-2">
                Услуга: {selectedService.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Запись к мастеру</CardTitle>
        <CardDescription>
          {masterName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full text-sm',
                  currentStep === step.key
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.key
                    ? 'bg-success text-success-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                {step.icon}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-4 h-px bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 'service' && (
          <div className="space-y-3">
            <h4 className="font-semibold mb-3">Выберите услугу</h4>
            {services.filter((s) => s.isActive).map((service) => (
              <div
                key={service.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all',
                  selectedServiceId === service.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => handleServiceSelect(service.id)}
              >
                <div className="flex-1">
                  <h5 className="font-medium">{service.name}</h5>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration} мин
                    </span>
                  </div>
                </div>
                <div className="font-heading font-bold">
                  {Number(service.price).toLocaleString('ru-RU')} ₽
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStep === 'datetime' && (
          <DateTimePicker
            selectedDate={selectedDate}
            selectedTime={selectedTime || undefined}
            availableSlots={availableSlots}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
          />
        )}

        {currentStep === 'confirm' && (
          <div className="space-y-4">
            <h4 className="font-semibold">Проверьте данные</h4>
            
            <div className="space-y-3 p-4 bg-secondary rounded-xl">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Мастер</p>
                  <p className="font-medium">{masterName}</p>
                </div>
              </div>
              
              {selectedService && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Услуга</p>
                    <p className="font-medium">{selectedService.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedService.duration} мин • {Number(selectedService.price).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Дата и время</p>
                  <p className="font-medium">{getDateTimeString()}</p>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Комментарий (необязательно)
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-[8px] border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Пожелания к услуге..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t">
          {currentStep !== 'service' ? (
            <Button variant="outline" onClick={handleBack}>
              Назад
            </Button>
          ) : (
            <div />
          )}
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            size="lg"
          >
            {currentStep === 'confirm' ? 'Подтвердить запись' : 'Далее'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
