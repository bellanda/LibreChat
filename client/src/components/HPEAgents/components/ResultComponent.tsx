import React from 'react';
import { cn } from '~/utils';
import { ResultMarkup } from '../types';

interface ResultComponentProps {
  data: ResultMarkup;
  className?: string;
}

const ResultComponent: React.FC<ResultComponentProps> = ({ data, className }) => {
  const getResultConfig = (type: string) => {
    const configs = {
      success: {
        icon: '✅',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400',
      },
      error: {
        icon: '❌',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-300',
        iconColor: 'text-red-600 dark:text-red-400',
      },
      warning: {
        icon: '⚠️',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-300',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
      },
      info: {
        icon: 'ℹ️',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-300',
        iconColor: 'text-blue-600 dark:text-blue-400',
      },
    };
    return configs[type as keyof typeof configs] || configs.info;
  };

  const config = getResultConfig(data.type);

  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        'transform transition-all duration-300 ease-in-out',
        'animate-in fade-in-0 zoom-in-95',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center">
            <span className="animate-bounce text-lg">{config.icon}</span>
          </div>
        </div>

        <div className="flex-1">
          <p className={cn('text-sm font-medium', config.textColor)}>{data.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultComponent;
