import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  show: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));

    // Auto-dismiss
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, duration);
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  }
}));
