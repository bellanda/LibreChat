import React from 'react';
import { cn } from '~/utils';
import { StepMarkup } from '../types';

interface StepComponentProps {
  data: StepMarkup;
  className?: string;
}

const StepComponent: React.FC<StepComponentProps> = ({ data, className }) => {
  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-4',
        'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20',
        'transform transition-all duration-300 ease-in-out',
        'animate-in fade-in-0 slide-in-from-left-5',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              'border-2 border-indigo-300 bg-indigo-100 dark:border-indigo-600 dark:bg-indigo-800',
              'animate-pulse',
            )}
          >
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
              {data.stepNumber}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
              Passo {data.stepNumber}
            </h3>
            <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-400">{data.message}</p>
        </div>
      </div>
    </div>
  );
};

export default StepComponent;
