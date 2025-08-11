import { MenuItem } from '@headlessui/react';
import { Label, OGDialog, OGDialogTemplate, Spinner, useToastContext } from '@librechat/client';
import { BookmarkFilledIcon, BookmarkIcon } from '@radix-ui/react-icons';
import type { TConversationTag } from 'librechat-data-provider';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { BookmarkEditDialog } from '~/components/Bookmarks';
import { useDeleteConversationTagMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';

type BookmarkItemWithActionsProps = {
  bookmark: TConversationTag;
  tag: string | React.ReactNode;
  selected: boolean;
  count?: number;
  handleSubmit: (tag?: string) => void;
  icon?: React.ReactNode;
  showActions?: boolean;
};

const BookmarkItemWithActions: FC<BookmarkItemWithActionsProps> = ({
  bookmark,
  tag,
  selected,
  handleSubmit,
  icon,
  showActions = true,
  ...rest
}) => {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteBookmarkMutation = useDeleteConversationTagMutation({
    onSuccess: () => {
      showToast({
        message: localize('com_ui_bookmarks_delete_success'),
      });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      showToast({
        message: localize('com_ui_bookmarks_delete_success'),
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const clickHandler = async () => {
    if (tag === 'New Bookmark') {
      handleSubmit();
      return;
    }

    setIsLoading(true);
    handleSubmit(tag as string);
    setIsLoading(false);
  };

  const breakWordStyle: React.CSSProperties = {
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  };

  const renderIcon = () => {
    if (icon != null) {
      return icon;
    }

    if (isLoading) {
      return <Spinner className="size-4" />;
    }

    if (selected) {
      return <BookmarkFilledIcon className="size-4" />;
    }

    return <BookmarkIcon className="size-4" />;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const confirmDelete = useCallback(async () => {
    await deleteBookmarkMutation.mutateAsync(bookmark.tag);
  }, [bookmark.tag, deleteBookmarkMutation]);

  return (
    <>
      <MenuItem
        aria-label={tag as string}
        className="group flex w-full gap-2 rounded-lg p-2.5 text-sm text-text-primary transition-colors duration-200 focus:outline-none data-[focus]:bg-surface-hover data-[focus-visible]:ring-2 data-[focus-visible]:ring-primary"
        {...rest}
        as="div"
      >
        <div className="flex gap-2 justify-between items-center grow">
          <button className="flex gap-2 items-center min-w-0 text-left grow" onClick={clickHandler}>
            {renderIcon()}
            <div style={breakWordStyle} className="flex-1 truncate" title={tag as string}>
              {tag}
            </div>
          </button>
          {/* {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex flex-shrink-0 justify-center items-center w-6 h-6 rounded-md opacity-0 transition-opacity hover:bg-surface-hover group-hover:opacity-100"
                  onClick={handleMenuClick}
                  aria-label={localize('com_ui_more_options')}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 w-48">
                <DropdownMenuItem onClick={handleEditClick} className="flex gap-2 items-center">
                  <Edit className="w-4 h-4" />
                  {localize('com_ui_edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="flex gap-2 items-center text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  {localize('com_ui_delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )} */}
        </div>
      </MenuItem>

      <BookmarkEditDialog
        context="BookmarkItemWithActions"
        bookmark={bookmark}
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
      />

      <OGDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <OGDialogTemplate
          showCloseButton={false}
          title={localize('com_ui_bookmarks_delete')}
          className="w-11/12 max-w-lg"
          main={
            <Label className="text-sm font-medium text-left">
              {localize('com_ui_bookmark_delete_confirm')} <strong>"{bookmark.tag}"</strong>?
            </Label>
          }
          selection={{
            selectHandler: confirmDelete,
            selectClasses:
              'bg-red-700 dark:bg-red-600 hover:bg-red-800 dark:hover:bg-red-800 text-white',
            selectText: localize('com_ui_delete'),
          }}
        />
      </OGDialog>
    </>
  );
};

export default BookmarkItemWithActions;
