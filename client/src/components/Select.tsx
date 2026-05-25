import React from 'react';
import { cn } from '../lib/utils';

export interface SelectOption { label: string; value: string; }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const generatedId = id || React.useId();
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={generatedId} className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 dark:text-zinc-500">
            {label}
          </label>
        )}
        <select
          id={generatedId}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-lg border bg-zinc-50 dark:bg-[#141414] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-200 transition-all duration-150 cursor-pointer appearance-none',
            'border-zinc-200 dark:border-white/[0.07]',
            'focus:outline-none focus:ring-1 focus:ring-violet-500/60 focus:border-violet-500/60 dark:focus:border-violet-500/40 dark:focus:ring-violet-500/30',
            'disabled:opacity-50 disabled:pointer-events-none',
            error && 'border-rose-500/60',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1a1a1a]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
