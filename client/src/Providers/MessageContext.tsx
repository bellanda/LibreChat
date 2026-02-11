import { createContext, useContext } from 'react';

type MessageContext = {
  messageId: string;
  nextType?: string;
  partIndex?: number;
  isExpanded: boolean;
  conversationId?: string | null;
  /** Submission state for cursor display - only true for latest message when submitting */
  isSubmitting?: boolean;
  /** Whether this is the latest message in the conversation */
  isLatestMessage?: boolean;
  /** Quando true, esconde o indicador "result-thinking" (bolinha) do Markdown — a barra unificada já mostra o estado */
  hideThinkingIndicator?: boolean;
};

export const MessageContext = createContext<MessageContext>({} as MessageContext);
export const useMessageContext = () => useContext(MessageContext);
