import React from 'react';
import { cn } from '~/utils';
import { CodeMarkup } from '../types';

interface CodeComponentProps {
  data: CodeMarkup;
  className?: string;
}

const CodeComponent: React.FC<CodeComponentProps> = ({ data, className }) => {
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'text-yellow-600 dark:text-yellow-400',
      python: 'text-blue-600 dark:text-blue-400',
      typescript: 'text-blue-600 dark:text-blue-400',
      java: 'text-orange-600 dark:text-orange-400',
      cpp: 'text-purple-600 dark:text-purple-400',
      html: 'text-red-600 dark:text-red-400',
      css: 'text-blue-600 dark:text-blue-400',
      default: 'text-gray-600 dark:text-gray-400',
    };
    return colors[language.toLowerCase()] || colors.default;
  };

  return (
    <div
      className={cn(
        'mx-auto my-4 w-full max-w-2xl rounded-lg border',
        'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20',
        'transform transition-all duration-300 ease-in-out',
        'animate-in fade-in-0 slide-in-from-left-5',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-400">
            💻
          </span>
          <span className={cn('font-mono text-xs font-semibold', getLanguageColor(data.language))}>
            {data.language.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-red-400"></div>
          <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
        </div>
      </div>

      {/* Code content */}
      <div className="p-4">
        <pre className="overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
          <code className="font-mono">{data.code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeComponent;
