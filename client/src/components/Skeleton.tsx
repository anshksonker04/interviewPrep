import React from 'react';
import { cn } from '../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => (
  <div
    className={cn('animate-pulse rounded-lg bg-zinc-200 dark:bg-white/[0.04]', className)}
    {...props}
  />
);
