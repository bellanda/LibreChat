import React, { useEffect, useState } from 'react';
import { cn } from '~/utils';
import { ProgressMarkup } from '../types';

interface ProgressComponentProps {
  data: ProgressMarkup;
  className?: string;
}

const ProgressComponent: React.FC<ProgressComponentProps> = ({ data, className }) => {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentProgress(data.percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [data.percentage]);

  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-4',
        'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
        'transform transition-all duration-500 ease-in-out',
        'animate-in fade-in-0 slide-in-from-left-5',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        </div>
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-blue-800 dark:text-blue-300">
            {data.message}
          </p>
          <div className="flex items-center gap-2">
            <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
              {Math.round(currentProgress)}%
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
          <div
            className={cn(
              'h-full bg-gradient-to-r from-blue-500 to-blue-600',
              'transition-all duration-1000 ease-out',
              'relative overflow-hidden',
            )}
            style={{ width: `${currentProgress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressComponent;
