import React from 'react';
import { cn } from '../lib/utils';

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-zinc-200/60 dark:border-white/[0.05] bg-white dark:bg-transparent">
    <table className={cn('w-full border-collapse text-left text-xs', className)} {...props} />
  </div>
);

export const THead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn(
    'bg-zinc-50 dark:bg-white/[0.02] text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600',
    'border-b border-zinc-200/60 dark:border-white/[0.05]',
    className
  )} {...props} />
);

export const TBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('divide-y divide-zinc-100 dark:divide-white/[0.03]', className)} {...props} />
);

export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors', className)} {...props} />
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cn('px-5 py-3 font-semibold', className)} {...props} />
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('px-5 py-3.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap', className)} {...props} />
);
