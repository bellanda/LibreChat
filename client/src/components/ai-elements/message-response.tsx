'use client';

import * as React from 'react';
import Markdown from '~/components/Chat/Messages/Content/Markdown';
import { cn } from '~/utils';

interface MessageResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string;
  isLatestMessage?: boolean;
}

/**
 * MessageResponse - Componente para renderizar respostas de mensagem.
 * 
 * Quando useVercelElements está habilitado, usa formatação mais limpa.
 * Caso contrário, usa o Markdown padrão do LibreChat para manter compatibilidade.
 */
const MessageResponse = React.forwardRef<HTMLDivElement, MessageResponseProps>(
  ({ children, className, isLatestMessage = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'markdown prose message-content dark:prose-invert light w-full break-words',
          className,
        )}
        {...props}
      >
        <Markdown content={children} isLatestMessage={isLatestMessage} />
      </div>
    );
  },
);
MessageResponse.displayName = 'MessageResponse';

export { MessageResponse };
