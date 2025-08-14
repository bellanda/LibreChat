import * as Ariakit from '@ariakit/react';
import { DropdownPopup, Spinner, TooltipAnchor, useToastContext } from '@librechat/client';
import { BookmarkFilledIcon, BookmarkIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import type { TConversationTag } from 'librechat-data-provider';
import { Constants, QueryKeys } from 'librechat-data-provider';
import { BookmarkPlusIcon, Edit, Trash2 } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import type * as t from '~/common';
import { NotificationSeverity } from '~/common';
import { BookmarkEditDialog } from '~/components/Bookmarks';
import {
  useConversationTagsQuery,
  useDeleteConversationTagMutation,
  useTagConversationMutation,
} from '~/data-provider';
import { useBookmarkSuccess, useLocalize } from '~/hooks';
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<TConversationTag | null>(null);

  const menuId = `bookmark-menu-${conversationId}`;

  const mutation = useTagConversationMutation(conversationId, {
    onSuccess: (newTags: string[], vars) => {
      updateConvoTags(newTags);
      const tagElement = document.getElementById(vars.tag);
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

  if (!isActiveConvo || isTemporary) {
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

  // Create dropdown items for DropdownPopup
  const dropdownItems: t.MenuItemProps[] = [
    {
      label: localize('com_ui_bookmarks_new'),
      onClick: handleNewBookmark,
      icon: <BookmarkPlusIcon className="size-4" />,
    },
    ...(data?.map((tag) => ({
      label: tag.tag,
      onClick: () => handleSubmit(tag.tag),
      icon: tags?.includes(tag.tag) ? (
        <BookmarkFilledIcon className="size-4" />
      ) : (
        <BookmarkIcon className="size-4" />
      ),
      actions: [
        {
          icon: <Edit className="w-4 h-4" />,
          label: localize('com_ui_edit'),
          onClick: () => handleEditBookmark(tag),
        },
        {
          icon: <Trash2 className="w-4 h-4" />,
          label: localize('com_ui_delete'),
          onClick: () => handleDeleteBookmark(tag),
          className: 'text-red-600 focus:text-red-600',
        },
      ],
    })) ?? []),
  ];

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
        items={dropdownItems}
        className="z-50"
        trigger={
          <TooltipAnchor
            description={localize('com_ui_bookmarks_add')}
            render={
              <Ariakit.MenuButton
                id="bookmark-button"
                aria-label={localize('com_ui_bookmarks_add')}
                className="inline-flex flex-shrink-0 justify-center items-center bg-transparent rounded-xl border transition-all ease-in-out size-10 border-border-light text-text-primary hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-50 radix-state-open:bg-surface-tertiary"
              >
                {renderButtonContent()}
              </Ariakit.MenuButton>
            }
          />
        }
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

      {/* Edit Bookmark Dialog */}
      <BookmarkEditDialog
        bookmark={editingBookmark || undefined}
        open={isEditDialogOpen}
        setOpen={(open) => {
          setIsEditDialogOpen(open);
        }}
        onSuccess={() => {
          setEditingBookmark(null);
        }}
        context="BookmarkMenu - EditBookmarkDialog"
      />
    </BookmarkContext.Provider>
  );
};

export default BookmarkMenu;
