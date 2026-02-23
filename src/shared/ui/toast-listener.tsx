'use client';

import { useState, useEffect } from 'react';
import { ToastContainer, toast } from './toast';

// Глобальный компонент для прослушивания toast событий
export function ToastListener() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>>([]);

  useEffect(() => {
    const listener = (newToasts: any[]) => {
      setToasts([...newToasts]);
    };

    // Подписываемся на изменения из глобального объекта toast
    (toast as any).subscribe(listener);
    
    // Инициализируем текущие toast
    setToasts((toast as any).getCurrentToasts());

    return () => {
      (toast as any).unsubscribe(listener);
    };
  }, []);

  const dismissToast = (id: string) => {
    (toast as any).dismiss(id);
  };

  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
}
