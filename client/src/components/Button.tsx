import React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', isLoading = false, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#15151E] disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97]';

    const variants = {
      primary:     'bg-gradient-to-r from-[#FF7A00] to-[#FF8C00] text-white hover:from-[#FF8C00] hover:to-[#FF7A00] shadow-sm shadow-orange-950/40 border border-[#FF7A00]/20',
      secondary:   'bg-[#1A1A24] text-[#E0E0E0] hover:bg-[#242432] border border-border/20',
      outline:     'border border-border/30 text-[#E0E0E0] hover:bg-white/[0.04]',
      ghost:       'text-[#E0E0E0] hover:text-[#FFFFFF] hover:bg-white/[0.04]',
      destructive: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm',
      link:        'text-[#FF7A00] hover:text-[#FF8C00] underline-offset-4 hover:underline p-0 active:scale-100',
    };

    const sizes = {
      default: 'h-9 px-4 text-xs',
      sm:      'h-7 px-3 text-[11px] rounded-md',
      lg:      'h-11 px-6 text-sm',
      icon:    'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
