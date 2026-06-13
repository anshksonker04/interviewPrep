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
          <label htmlFor={generatedId} className="text-[10px] font-semibold tracking-widest uppercase text-white">
            {label}
          </label>
        )}
        <select
          id={generatedId}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-lg border bg-[#15151E] px-3 py-2 text-sm text-[#FFFFFF] transition-all duration-150 cursor-pointer appearance-none',
            'border-border/30',
            'focus:outline-none focus:ring-1 focus:ring-[#FF7A00]/60 focus:border-[#FF7A00]',
            'disabled:opacity-50 disabled:pointer-events-none',
            error && 'border-rose-500/60',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1A1A24] text-[#FFFFFF]">
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
