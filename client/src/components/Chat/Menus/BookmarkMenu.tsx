import { BookmarkFilledIcon, BookmarkIcon } from '@radix-ui/react-icons';
import { Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import { useQueryClient } from '@tanstack/react-query';
import type { TConversationTag } from 'librechat-data-provider';
import { Constants, QueryKeys } from 'librechat-data-provider';
import { BookmarkPlusIcon } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { NotificationSeverity } from '~/common';
import { Spinner } from '~/components';
import { BookmarkEditDialog } from '~/components/Bookmarks';
import { TooltipAnchor } from '~/components/ui';
import { useConversationTagsQuery, useTagConversationMutation } from '~/data-provider';
import { useBookmarkSuccess, useLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';
import { BookmarkContext } from '~/Providers/BookmarkContext';
import store from '~/store';
import { logger } from '~/utils';

const BookmarkMenu: FC = () => {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  const conversation = useRecoilValue(store.conversationByIndex(0)) || undefined;
  const conversationId = conversation?.conversationId ?? '';
  const updateConvoTags = useBookmarkSuccess(conversationId);
  const tags = conversation?.tags;
  const isTemporary = conversation?.expiredAt != null;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mutation = useTagConversationMutation(conversationId, {
    onSuccess: (newTags: string[], vars) => {
      updateConvoTags(newTags);
      const tagElement = document.getElementById(vars.tag);
      console.log('tagElement', tagElement);
      if (tagElement) {
        setTimeout(() => tagElement.focus(), 2);
      }
    },
    onError: () => {
      showToast({
        message: 'Error adding bookmark',
        severity: NotificationSeverity.ERROR,
      });
    },
    onMutate: (vars) => {
      const tagElement = document.getElementById(vars.tag);
      console.log('tagElement', tagElement);
      if (tagElement) {
        setTimeout(() => tagElement.focus(), 2);
      }
    },
  });

  const { data } = useConversationTagsQuery();

  const isActiveConvo = Boolean(
    conversation &&
      conversationId &&
      conversationId !== Constants.NEW_CONVO &&
      conversationId !== 'search',
  );

  const handleSubmit = useCallback(
    (tag?: string) => {
      if (tag === undefined || tag === '' || !conversationId) {
        showToast({
          message: 'Invalid tag or conversationId',
          severity: NotificationSeverity.ERROR,
        });
        return;
      }

      logger.log('tag_mutation', 'BookmarkMenu - handleSubmit: tags before setting', tags);

      const allTags =
        queryClient.getQueryData<TConversationTag[]>([QueryKeys.conversationTags]) ?? [];
      const existingTags = allTags.map((t) => t.tag);
      const filteredTags = tags?.filter((t) => existingTags.includes(t));

      logger.log('tag_mutation', 'BookmarkMenu - handleSubmit: tags after filtering', filteredTags);
      const newTags =
        filteredTags?.includes(tag) === true
          ? filteredTags.filter((t) => t !== tag)
          : [...(filteredTags ?? []), tag];

      logger.log('tag_mutation', 'BookmarkMenu - handleSubmit: tags after', newTags);
      mutation.mutate({
        tags: newTags,
        tag,
      });
    },
    [tags, conversationId, mutation, queryClient, showToast],
  );

  const newBookmarkRef = useRef<HTMLButtonElement>(null);

  if (!isActiveConvo) {
    return null;
  }

  if (isTemporary) {
    return null;
  }

  const renderButtonContent = () => {
    if (mutation.isLoading) {
      return <Spinner aria-label="Spinner" />;
    }
    if ((tags?.length ?? 0) > 0) {
      return <BookmarkFilledIcon className="icon-sm" aria-label="Filled Bookmark" />;
    }
    return <BookmarkIcon className="icon-sm" aria-label="Bookmark" />;
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks: data || [] }}>
      <Root>
        <Trigger asChild>
          <TooltipAnchor
            id="bookmark-button"
            aria-label={localize('com_ui_bookmarks_add')}
            description={localize('com_ui_bookmarks_add')}
            tabIndex={0}
            role="button"
            data-testid="bookmark-button"
            className="inline-flex size-10 flex-shrink-0 items-center justify-center rounded-xl border border-border-light bg-transparent text-text-primary transition-all ease-in-out hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50 radix-state-open:bg-surface-tertiary"
          >
            {renderButtonContent()}
          </TooltipAnchor>
        </Trigger>
        <Portal>
          <div
            style={{
              position: 'fixed',
              left: '0px',
              top: '0px',
              transform: 'translate3d(268px, 50px, 0px)',
              minWidth: 'max-content',
              zIndex: 'auto',
            }}
          >
            <Content
              side="bottom"
              align="center"
              className="mt-2 max-h-[495px] overflow-x-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white md:min-w-[400px]"
            >
              <div className="p-2">
                {/* New Bookmark Button */}
                <button
                  ref={newBookmarkRef}
                  onClick={() => setIsDialogOpen(true)}
                  className="group m-1.5 flex w-full cursor-pointer gap-2 rounded px-5 py-2.5 !pr-3 text-sm !opacity-100 hover:bg-black/5 focus:ring-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 dark:hover:bg-gray-600 md:min-w-[240px]"
                >
                  <div className="flex grow items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookmarkPlusIcon className="size-4" />
                      <div>{localize('com_ui_bookmarks_new')}</div>
                    </div>
                  </div>
                </button>

                {/* Existing Bookmarks */}
                {data &&
                  data.map((tag, index) => {
                    const isSelected = tags?.includes(tag.tag);
                    return (
                      <button
                        key={tag.tag}
                        onClick={() => handleSubmit(tag.tag)}
                        disabled={mutation.isLoading}
                        className="group m-1.5 flex w-full cursor-pointer gap-2 rounded px-5 py-2.5 !pr-3 text-sm !opacity-100 hover:bg-black/5 focus:ring-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 dark:hover:bg-gray-600 md:min-w-[240px]"
                      >
                        <div className="flex grow items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <BookmarkFilledIcon className="size-4" />
                            ) : (
                              <BookmarkIcon className="size-4" />
                            )}
                            <div className="truncate">{tag.tag}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </Content>
          </div>
        </Portal>
      </Root>
      <BookmarkEditDialog
        tags={tags}
        open={isDialogOpen}
        setTags={updateConvoTags}
        setOpen={setIsDialogOpen}
        triggerRef={newBookmarkRef}
        conversationId={conversationId}
        context="BookmarkMenu - BookmarkEditDialog"
      />
    </BookmarkContext.Provider>
  );
};

export default BookmarkMenu;
