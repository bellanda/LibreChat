import { AlertCircle } from 'lucide-react';
import React from 'react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface SmartUploadErrorModalProps {
  file: File;
  errorMessage: string;
  onClose: () => void;
}

/**
 * Modal exibido quando a validação do upload inteligente falha (ex.: arquivo excede limite).
 */
export function SmartUploadErrorModal({ file, errorMessage, onClose }: SmartUploadErrorModalProps) {
  const localize = useLocalize();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-upload-error-title"
    >
      <div
        className={cn(
          'mx-4 w-full max-w-md rounded-lg border border-border-medium bg-surface-primary p-6 shadow-lg',
        )}
      >
        <div className="mb-4 flex items-start gap-3">
          <AlertCircle className="size-10 shrink-0 text-red-500" aria-hidden />
          <div className="min-w-0 flex-1">
            <h3
              id="smart-upload-error-title"
              className="font-semibold text-red-600 dark:text-red-400"
            >
              {localize('com_ui_upload_error')}
            </h3>
            <p className="mt-1 truncate text-sm text-text-secondary" title={file.name}>
              {file.name}
            </p>
          </div>
        </div>
        <div className="mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
            'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          )}
        >
          {localize('com_ui_close')}
        </button>
      </div>
    </div>
  );
}
