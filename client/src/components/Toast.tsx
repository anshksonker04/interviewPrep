import React from 'react';
import { useToastStore, ToastItem } from '../store/toastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const configs = {
    success: { icon: <CheckCircle2 className="w-4 h-4 shrink-0" />, accent: 'text-emerald-500', bar: 'bg-emerald-500' },
    error:   { icon: <AlertCircle  className="w-4 h-4 shrink-0" />, accent: 'text-rose-500',    bar: 'bg-rose-500'    },
    warning: { icon: <AlertTriangle className="w-4 h-4 shrink-0" />, accent: 'text-amber-500',   bar: 'bg-amber-500'   },
    info:    { icon: <Info         className="w-4 h-4 shrink-0" />, accent: 'text-violet-500',  bar: 'bg-violet-500'  },
  };
  const c = configs[toast.type];

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border/30 bg-card shadow-2xl shadow-black/40 flex items-start gap-3 p-4 animate-slide-up"
      role="alert"
    >
      {/* Colored left bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-0.5', c.bar)} />

      <span className={cn('mt-0.5', c.accent)}>{c.icon}</span>
      <p className="flex-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">{toast.message}</p>
      <button onClick={onDismiss} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors mt-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
