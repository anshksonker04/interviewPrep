import React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, id, ...props }, ref) => {
    const generatedId = id || React.useId();
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={generatedId} className="text-[10px] font-semibold tracking-widest uppercase text-white">
            {label}
          </label>
        )}
        <input
          id={generatedId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-lg border bg-[#15151E] px-3 py-2 text-sm text-[#FFFFFF] placeholder:text-zinc-500 transition-all duration-150',
            'border-border/30',
            'focus:outline-none focus:ring-1 focus:ring-[#FF7A00]/60 focus:border-[#FF7A00]',
            'disabled:opacity-50 disabled:pointer-events-none',
            error && 'border-rose-500/60 focus:ring-rose-500/40',
            className
          )}
          {...props}
        />
        {error && <span className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
