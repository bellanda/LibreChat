import * as Ariakit from '@ariakit/react';
import { DropdownPopup, Spinner, TooltipAnchor, useToastContext } from '@librechat/client';
import { BookmarkFilledIcon, BookmarkIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import type { TConversationTag } from 'librechat-data-provider';
import { Constants, QueryKeys } from 'librechat-data-provider';
import { BookmarkPlusIcon } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import type * as t from '~/common';
import { NotificationSeverity } from '~/common';
import { BookmarkEditDialog } from '~/components/Bookmarks';
import { useConversationTagsQuery, useDeleteConversationTagMutation, useTagConversationMutation } from '~/data-provider';
import { useBookmarkSuccess, useLocalize } from '~/hooks';
import { BookmarkContext } from '~/Providers/BookmarkContext';
import store from '~/store';
import { cn, logger } from '~/utils';

const BookmarkMenu: FC = () => {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();

  const conversation = useRecoilValue(store.conversationByIndex(0)) || undefined;
  const conversationId = conversation?.conversationId ?? '';
  const updateConvoTags = useBookmarkSuccess(conversationId);
  const tags = conversation?.tags;
  const isTemporary = conversation?.expiredAt != null;

  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<TConversationTag | null>(null);



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

  const deleteBookmarkMutation = useDeleteConversationTagMutation({
    onSuccess: () => {
      showToast({
        message: localize('com_ui_bookmarks_delete_success'),
      });
    },
    onError: () => {
      showToast({
        message: localize('com_ui_bookmarks_delete_error'),
        severity: NotificationSeverity.ERROR,
      });
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

  const handleEditBookmark = useCallback((bookmark: TConversationTag) => {
    setEditingBookmark(bookmark);
    setIsEditDialogOpen(true);
    setIsMenuOpen(false);
  }, []);

  const handleDeleteBookmark = useCallback(
    (bookmark: TConversationTag) => {
      deleteBookmarkMutation.mutate(bookmark.tag);
      setIsMenuOpen(false);
    },
    [deleteBookmarkMutation],
  );

  const handleNewBookmark = useCallback(() => {
    setIsDialogOpen(true);
    setIsMenuOpen(false);
  }, []);

  const newBookmarkRef = useRef<HTMLButtonElement>(null);

  const dropdownItems: t.MenuItemProps[] = useMemo(() => {
    const items: t.MenuItemProps[] = [
      {
        id: '%___new___bookmark___%',
        label: localize('com_ui_bookmarks_new'),
        icon: <BookmarkPlusIcon className="size-4" />,
        hideOnClick: false,
        ref: newBookmarkRef,
        render: (props) => <button {...props} />,
        onClick: () => setIsDialogOpen(true),
      },
    ];

    if (data) {
      for (const tag of data) {
        const isSelected = tags?.includes(tag.tag);
        items.push({
          id: tag.tag,
          label: tag.tag,
          hideOnClick: false,
          icon:
            isSelected === true ? (
              <BookmarkFilledIcon className="size-4" />
            ) : (
              <BookmarkIcon className="size-4" />
            ),
          onClick: () => handleSubmit(tag.tag),
          disabled: mutation.isLoading,
        });
      }
    }

    return items;
  }, [tags, data, handleSubmit, mutation.isLoading, localize]);

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
      return <BookmarkFilledIcon className="icon-lg" aria-label="Filled Bookmark" />;
    }
    return <BookmarkIcon className="icon-lg" aria-label="Bookmark" />;
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks: data || [] }}>
      <DropdownPopup
        portal={true}
        mountByState={true}
        menuId={menuId}
        focusLoop={true}
        isOpen={isMenuOpen}
        unmountOnHide={true}
        setIsOpen={setIsMenuOpen}
        keyPrefix={`${conversationId}-bookmark-`}
        trigger={
          <TooltipAnchor
            description={localize('com_ui_bookmarks_add')}
            render={
              <Ariakit.MenuButton
                id="bookmark-menu-button"
                aria-label={localize('com_ui_bookmarks_add')}
                className={cn(
                  'mt-text-sm flex size-10 flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-border-light bg-presentation text-sm transition-colors duration-200 hover:bg-surface-hover',
                  isMenuOpen ? 'bg-surface-hover' : '',
                )}
                data-testid="bookmark-menu"
              >
                {renderButtonContent()}
              </Ariakit.MenuButton>
            }
          />
        }
        items={dropdownItems}
      />

      {/* New Bookmark Dialog */}
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
