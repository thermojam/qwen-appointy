'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastColors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-500 text-green-900 shadow-lg',
  error: 'bg-red-50 border-red-500 text-red-900 shadow-lg',
  warning: 'bg-amber-50 border-amber-500 text-amber-900 shadow-lg',
  info: 'bg-blue-50 border-blue-500 text-blue-900 shadow-lg',
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-sm',
              'animate-in slide-in-from-right-full fade-in duration-300',
              toastColors[toast.type]
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{toast.title}</p>
              {toast.message && (
                <p className="text-sm opacity-90 mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}

// Hook для управления toast
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach(listener => listener(currentToasts));

    // Auto-dismiss
    if (newToast.duration) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const dismissToast = (id: string) => {
    currentToasts = currentToasts.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(currentToasts));
  };

  const success = (title: string, message?: string) =>
    addToast({ type: 'success', title, message });

  const error = (title: string, message?: string) =>
    addToast({ type: 'error', title, message });

  const warning = (title: string, message?: string) =>
    addToast({ type: 'warning', title, message });

  const info = (title: string, message?: string) =>
    addToast({ type: 'info', title, message });

  return { addToast, dismissToast, success, error, warning, info };
}

// Глобальные функции для использования вне компонентов

export const toast = {
  success: (title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type: 'success', title, message, duration: 5000 };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach(listener => listener(currentToasts));
    setTimeout(() => {
      currentToasts = currentToasts.filter(t => t.id !== id);
      toastListeners.forEach(listener => listener(currentToasts));
    }, 5000);
  },
  error: (title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type: 'error', title, message, duration: 5000 };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach(listener => listener(currentToasts));
    setTimeout(() => {
      currentToasts = currentToasts.filter(t => t.id !== id);
      toastListeners.forEach(listener => listener(currentToasts));
    }, 5000);
  },
  warning: (title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type: 'warning', title, message, duration: 5000 };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach(listener => listener(currentToasts));
    setTimeout(() => {
      currentToasts = currentToasts.filter(t => t.id !== id);
      toastListeners.forEach(listener => listener(currentToasts));
    }, 5000);
  },
  info: (title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type: 'info', title, message, duration: 5000 };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach(listener => listener(currentToasts));
    setTimeout(() => {
      currentToasts = currentToasts.filter(t => t.id !== id);
      toastListeners.forEach(listener => listener(currentToasts));
    }, 5000);
  },
  // Функции для ToastListener
  subscribe: (listener: (toasts: Toast[]) => void) => {
    toastListeners.push(listener);
  },
  unsubscribe: (listener: (toasts: Toast[]) => void) => {
    const idx = toastListeners.indexOf(listener);
    if (idx > -1) {
      toastListeners.splice(idx, 1);
    }
  },
  getCurrentToasts: () => currentToasts,
  dismiss: (id: string) => {
    currentToasts = currentToasts.filter(t => t.id !== id);
    toastListeners.forEach(listener => listener(currentToasts));
  },
};
