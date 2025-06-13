import { memo, ReactElement, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import Markdown from '~/components/Chat/Messages/Content/Markdown';
import MarkdownLite from '~/components/Chat/Messages/Content/MarkdownLite';
import HPEAgentsProcessor from '~/components/HPEAgents/HPEAgentsProcessor';
import '~/components/HPEAgents/styles.css';
import { useHPEAgentsProcessor } from '~/hooks/useHPEAgentsProcessor';
import { useChatContext, useMessageContext } from '~/Providers';
import store from '~/store';
import { cn } from '~/utils';

type TextPartProps = {
  text: string;
  showCursor: boolean;
  isCreatedByUser: boolean;
};

type ContentType =
  | ReactElement<React.ComponentProps<typeof Markdown>>
  | ReactElement<React.ComponentProps<typeof MarkdownLite>>
  | ReactElement;

const TextPart = memo(({ text, isCreatedByUser, showCursor }: TextPartProps) => {
  const { messageId } = useMessageContext();
  const { isSubmitting, latestMessage } = useChatContext();
  const enableUserMsgMarkdown = useRecoilValue(store.enableUserMsgMarkdown);
  const showCursorState = useMemo(() => showCursor && isSubmitting, [showCursor, isSubmitting]);
  const isLatestMessage = useMemo(
    () => messageId === latestMessage?.messageId,
    [messageId, latestMessage?.messageId],
  );

  // Hook para processar marcações HPEAgents
  const { shouldUseProcessor } = useHPEAgentsProcessor(text);

  const content: ContentType = useMemo(() => {
    // Se o texto contém marcações HPEAgents, usar o processador especial
    if (shouldUseProcessor && !isCreatedByUser) {
      return <HPEAgentsProcessor text={text} className="hpe-agents-content" />;
    }

    // Caso contrário, usar o comportamento padrão
    if (!isCreatedByUser) {
      return <Markdown content={text} isLatestMessage={isLatestMessage} />;
    } else if (enableUserMsgMarkdown) {
      return <MarkdownLite content={text} />;
    } else {
      return <>{text}</>;
    }
  }, [isCreatedByUser, enableUserMsgMarkdown, text, isLatestMessage, shouldUseProcessor]);

  return (
    <div
      className={cn(
        isSubmitting ? 'submitting' : '',
        showCursorState && !!text.length ? 'result-streaming' : '',
        'markdown prose message-content dark:prose-invert light w-full break-words',
        isCreatedByUser && !enableUserMsgMarkdown && 'whitespace-pre-wrap',
        isCreatedByUser ? 'dark:text-gray-20' : 'dark:text-gray-100',
        // Classe especial para conteúdo HPEAgents
        shouldUseProcessor && !isCreatedByUser && 'hpe-agents-message',
      )}
    >
      {content}
    </div>
  );
});

export default TextPart;
