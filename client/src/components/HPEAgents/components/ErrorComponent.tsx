import React from 'react';
import { cn } from '~/utils';

interface ErrorComponentProps {
  data: { message: string };
  className?: string;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({ data, className }) => {
  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-4',
        'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
        'transform transition-all duration-300 ease-in-out',
        'animate-in fade-in-0 slide-in-from-bottom-3',
        'animate-[shake_0.5s_ease-in-out]',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center">
            <span className="text-lg text-red-600 dark:text-red-400">❌</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{data.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
