import React from 'react';
import { cn } from '~/utils';

interface WarningComponentProps {
  data: { message: string };
  className?: string;
}

const WarningComponent: React.FC<WarningComponentProps> = ({ data, className }) => {
  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-4',
        'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
        'transform transition-all duration-300 ease-in-out',
        'animate-in fade-in-0 slide-in-from-top-3',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center">
            <span className="animate-pulse text-lg text-yellow-600 dark:text-yellow-400">⚠️</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{data.message}</p>
        </div>
      </div>
    </div>
  );
};

export default WarningComponent;
