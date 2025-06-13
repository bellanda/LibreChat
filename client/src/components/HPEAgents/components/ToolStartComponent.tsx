import React, { useEffect, useState } from 'react';
import { cn } from '~/utils';
import { ToolMarkup } from '../types';

interface ToolStartComponentProps {
  data: ToolMarkup;
  className?: string;
}

const ToolStartComponent: React.FC<ToolStartComponentProps> = ({ data, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getToolIcon = (toolName: string) => {
    const icons: Record<string, string> = {
      web_search: '🔍',
      busca_web: '🔍',
      file_reader: '📁',
      code_executor: '💻',
      api_caller: '🌐',
      database: '🗄️',
      default: '🔧',
    };
    return icons[toolName.toLowerCase()] || icons.default;
  };

  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-md rounded-lg border p-4',
        'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20',
        'transform transition-all duration-500 ease-in-out',
        isVisible ? 'animate-in fade-in-0 slide-in-from-top-5' : '-translate-y-5 opacity-0',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-orange-100 dark:bg-orange-800">
            {/* Pulsing background */}
            <div className="absolute inset-0 animate-ping rounded-full bg-orange-500 opacity-25" />
            <div className="relative text-lg">{getToolIcon(data.toolName)}</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              {data.toolName.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </h3>
            <div className="flex space-x-1">
              <div className="h-1 w-1 animate-bounce rounded-full bg-orange-500" />
              <div
                className="h-1 w-1 animate-bounce rounded-full bg-orange-500"
                style={{ animationDelay: '0.1s' }}
              />
              <div
                className="h-1 w-1 animate-bounce rounded-full bg-orange-500"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
          </div>
          <p className="text-xs text-orange-700 dark:text-orange-400">{data.message}</p>
        </div>
      </div>
    </div>
  );
};

export default ToolStartComponent;
