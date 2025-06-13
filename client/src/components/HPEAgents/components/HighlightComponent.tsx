import React from 'react';
import { cn } from '~/utils';

interface HighlightComponentProps {
  data: { message: string };
  className?: string;
}

const HighlightComponent: React.FC<HighlightComponentProps> = ({ data, className }) => {
  return (
    <div
      className={cn(
        'my-2 inline-block rounded-md px-3 py-2',
        'border border-yellow-300 bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-900/30',
        'text-yellow-900 dark:text-yellow-200',
        'transform transition-all duration-300 ease-in-out',
        'scale-in-95 animate-in fade-in-0',
        'relative overflow-hidden',
        className,
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative flex items-center gap-2">
        <span className="animate-pulse text-sm">⭐</span>
        <span className="text-sm font-medium">{data.message}</span>
      </div>
    </div>
  );
};

export default HighlightComponent;
