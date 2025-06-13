import React, { useEffect, useState } from 'react';
import { cn } from '~/utils';
import { ToolMarkup } from '../types';

interface ToolEndComponentProps {
  data: ToolMarkup;
  className?: string;
}

const ToolEndComponent: React.FC<ToolEndComponentProps> = ({ data, className }) => {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-4',
        'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
        'transform transition-all duration-500 ease-in-out',
        'animate-in fade-in-0 slide-in-from-bottom-5',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
            {showCheck && (
              <div className="relative">
                <svg
                  className="h-5 w-5 text-green-600 duration-300 animate-in zoom-in-75 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                    className="animate-[draw_0.5s_ease-in-out_forwards]"
                    style={{
                      strokeDasharray: '20',
                      strokeDashoffset: '20',
                    }}
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="mb-1 text-sm font-semibold text-green-800 dark:text-green-300">
            {data.toolName.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} - Concluído
          </h3>
          <p className="text-xs text-green-700 dark:text-green-400">{data.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ToolEndComponent;
