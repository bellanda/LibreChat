import { useAtomValue } from 'jotai';
import type { TMessage } from 'librechat-data-provider';
import { MessageSquare } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { useRecoilValue } from 'recoil';
import ScrollToBottom from '~/components/Messages/ScrollToBottom';
import { useLocalize, useMessageScrolling, useScreenshot } from '~/hooks';
import { MessagesViewProvider } from '~/Providers';
import store from '~/store';
import { fontSizeAtom } from '~/store/fontSize';
import { cn } from '~/utils';
import MultiMessage from './MultiMessage';

function MessagesViewContent({
  messagesTree: _messagesTree,
}: {
  messagesTree?: TMessage[] | null;
}) {
  const localize = useLocalize();
  const navigate = useNavigate();
  const fontSize = useAtomValue(fontSizeAtom);
  const { screenshotTargetRef } = useScreenshot();
  const scrollButtonPreference = useRecoilValue(store.showScrollButton);
  const [currentEditId, setCurrentEditId] = useState<number | string | null>(-1);
  const scrollToBottomRef = useRef<HTMLButtonElement>(null);

  const {
    conversation,
    scrollableRef,
    messagesEndRef,
    showScrollButton,
    handleSmoothToRef,
    debouncedHandleScroll,
  } = useMessageScrolling(_messagesTree);

  const { conversationId } = conversation ?? {};

  return (
    <>
      <div className="relative flex-1 overflow-hidden overflow-y-auto">
        <div className="relative h-full">
          <div
            className="scrollbar-gutter-stable"
            onScroll={debouncedHandleScroll}
            ref={scrollableRef}
            style={{
              height: '100%',
              overflowY: 'auto',
              width: '100%',
            }}
          >
            <div className="flex flex-col pb-9 pt-14 dark:bg-transparent">
              {(_messagesTree && _messagesTree.length == 0) || _messagesTree === null ? (
                <div
                  className={cn(
                    'flex w-full flex-col items-center justify-center gap-4 p-6 text-text-secondary',
                    fontSize,
                  )}
                  role="status"
                >
                  <MessageSquare
                    className="h-12 w-12 opacity-40"
                    aria-hidden
                  />
                  <p className="text-center">{localize('com_ui_nothing_found')}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/c/new', { state: { focusChat: true } })}
                    className="rounded-lg border border-border-medium bg-surface-secondary px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
                  >
                    {localize('com_ui_empty_conversation_cta')}
                  </button>
                </div>
              ) : (
                <>
                  <div ref={screenshotTargetRef}>
                    <MultiMessage
                      key={conversationId}
                      messagesTree={_messagesTree}
                      messageId={conversationId ?? null}
                      setCurrentEditId={setCurrentEditId}
                      currentEditId={currentEditId ?? null}
                    />
                  </div>
                </>
              )}
              <div
                id="messages-end"
                className="group h-0 w-full flex-shrink-0"
                ref={messagesEndRef}
              />
            </div>
          </div>

          <CSSTransition
            in={showScrollButton && scrollButtonPreference}
            timeout={{
              enter: 550,
              exit: 700,
            }}
            classNames="scroll-animation"
            unmountOnExit={true}
            appear={true}
            nodeRef={scrollToBottomRef}
          >
            <ScrollToBottom ref={scrollToBottomRef} scrollHandler={handleSmoothToRef} />
          </CSSTransition>
        </div>
      </div>
    </>
  );
}

export default function MessagesView({ messagesTree }: { messagesTree?: TMessage[] | null }) {
  return (
    <MessagesViewProvider>
      <MessagesViewContent messagesTree={messagesTree} />
    </MessagesViewProvider>
  );
}
