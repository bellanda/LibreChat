import React from 'react';
import { cn } from '~/utils';
import { StatusMarkup } from '../types';

interface StatusComponentProps {
  data: StatusMarkup;
  className?: string;
}

const StatusComponent: React.FC<StatusComponentProps> = ({ data, className }) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      processing: {
        icon: '⚡',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-300',
        animation: 'animate-pulse',
      },
      completed: {
        icon: '✅',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-300',
        animation: 'animate-bounce',
      },
      error: {
        icon: '❌',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-300',
        animation: 'animate-pulse',
      },
      waiting: {
        icon: '⏳',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-300',
        animation: 'animate-pulse',
      },
      analyzing: {
        icon: '🔍',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        textColor: 'text-purple-800 dark:text-purple-300',
        animation: 'animate-pulse',
      },
    };
    return configs[status as keyof typeof configs] || configs.processing;
  };

  const config = getStatusConfig(data.status);

  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-3',
        config.bgColor,
        config.borderColor,
        'transform transition-all duration-300 ease-in-out',
        'animate-in fade-in-0 slide-in-from-left-3',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('text-lg', config.animation)}>{config.icon}</div>
        <div className="flex-1">
          <p className={cn('text-sm font-medium', config.textColor)}>{data.message}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusComponent;
