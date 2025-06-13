import React, { useEffect, useState } from 'react';
import { cn } from '~/utils';

interface ThinkingComponentProps {
  data: { message: string };
  className?: string;
}

const ThinkingComponent: React.FC<ThinkingComponentProps> = ({ data, className }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-4',
        'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20',
        'transform transition-all duration-300 ease-in-out',
        'animate-in fade-in-0 slide-in-from-right-3',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
            <span className="animate-pulse text-xs">🤔</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm italic text-purple-800 dark:text-purple-300">
            {data.message}
            <span className="font-mono">{dots}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThinkingComponent;
