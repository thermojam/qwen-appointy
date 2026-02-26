'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Clock, Coffee, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { Schedule } from '@/shared/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';

interface ScheduleEditorProps {
  selectedDate: Date;
  existingSchedule: Schedule | null;
  onSave: (data: { startTime: string; endTime: string; breakStart?: string; breakEnd?: string }) => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

interface FormState {
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  showBreak: boolean;
}

function initForm(schedule: Schedule | null): FormState {
  return {
    startTime: schedule?.startTime ?? '09:00',
    endTime: schedule?.endTime ?? '18:00',
    breakStart: schedule?.breakStart ?? '',
    breakEnd: schedule?.breakEnd ?? '',
    showBreak: !!(schedule?.breakStart && schedule?.breakEnd),
  };
}

export function ScheduleEditor({
  selectedDate,
  existingSchedule,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
}: ScheduleEditorProps) {
  const [isEditing, setIsEditing] = useState(!existingSchedule);
  const [form, setForm] = useState<FormState>(() => initForm(existingSchedule));
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Reset when date/schedule changes
  useEffect(() => {
    setForm(initForm(existingSchedule));
    setIsEditing(!existingSchedule);
    setError(null);
    setConfirmingDelete(false);
  }, [existingSchedule, selectedDate]);

  const formattedDate = format(selectedDate, 'EEEE · d MMMM yyyy', { locale: ru });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const handleSubmit = () => {
    if (!form.startTime || !form.endTime) {
      setError('Пожалуйста, укажите время начала и конца');
      return;
    }
    if (form.startTime === form.endTime) {
      setError('Время начала и конца не могут совпадать');
      return;
    }
    if (form.showBreak && (!form.breakStart || !form.breakEnd)) {
      setError('Укажите время начала и конца перерыва');
      return;
    }
    setError(null);
    onSave({
      startTime: form.startTime,
      endTime: form.endTime,
      breakStart: form.showBreak && form.breakStart ? form.breakStart : undefined,
      breakEnd: form.showBreak && form.breakEnd ? form.breakEnd : undefined,
    });
    setIsEditing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{capitalizedDate}</CardTitle>
          {existingSchedule && !isEditing && (
            <div className="flex items-center gap-2">
              {confirmingDelete ? (
                <>
                  <span className="text-sm text-muted-foreground">Вы уверены?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setConfirmingDelete(false);
                      onDelete();
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Удаление...' : 'Удалить'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={isDeleting}
                  >
                    Отмена
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Удалить
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View mode */}
        {existingSchedule && !isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>
                Рабочее время: <span className="font-medium">{existingSchedule.startTime} — {existingSchedule.endTime}</span>
              </span>
            </div>
            {existingSchedule.breakStart && existingSchedule.breakEnd && (
              <div className="flex items-center gap-3 text-sm">
                <Coffee className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>
                  Перерыв: <span className="font-medium">{existingSchedule.breakStart} — {existingSchedule.breakEnd}</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Edit / Create mode */
          <div className="space-y-4">
            {/* Working hours */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Рабочее время
              </p>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="w-32"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="w-32"
                />
              </div>
            </div>

            {/* Break toggle */}
            <div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, showBreak: !f.showBreak }))}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Coffee className="w-4 h-4" />
                {form.showBreak ? 'Убрать перерыв' : 'Добавить перерыв'}
                {form.showBreak ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {form.showBreak && (
                <div className="mt-3 flex items-center gap-3">
                  <Input
                    type="time"
                    value={form.breakStart}
                    onChange={(e) => setForm((f) => ({ ...f, breakStart: e.target.value }))}
                    className="w-32"
                    placeholder="13:00"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="time"
                    value={form.breakEnd}
                    onChange={(e) => setForm((f) => ({ ...f, breakEnd: e.target.value }))}
                    className="w-32"
                    placeholder="14:00"
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Сохранение...' : existingSchedule ? 'Сохранить изменения' : 'Создать расписание'}
              </Button>
              {existingSchedule && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm(initForm(existingSchedule));
                    setIsEditing(false);
                    setError(null);
                  }}
                >
                  Отмена
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
