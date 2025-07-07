import type { TConversationTag } from 'librechat-data-provider';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { NotificationSeverity } from '~/common';
import { DeleteBookmarkButton, EditBookmarkButton } from '~/components/Bookmarks';
import { TableCell, TableRow } from '~/components/ui';
import { useConversationTagMutation } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { useToastContext } from '~/Providers';

interface BookmarkTableRowProps {
  row: TConversationTag;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  position: number;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const BookmarkTableRow: React.FC<BookmarkTableRowProps> = ({ row, moveRow, position }) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const mutation = useConversationTagMutation({ context: 'BookmarkTableRow', tag: row.tag });
  const localize = useLocalize();
  const { showToast } = useToastContext();

  const handleDrop = (item: DragItem) => {
    mutation.mutate(
      { ...row, position: item.index },
      {
        onError: () => {
          showToast({
            message: localize('com_ui_bookmarks_update_error'),
            severity: NotificationSeverity.ERROR,
          });
        },
      },
    );
  };

  const [, drop] = useDrop({
    accept: 'bookmark',
    drop: handleDrop,
    hover(item: DragItem) {
      if (!ref.current || item.index === position) {
        return;
      }
      moveRow(item.index, position);
      item.index = position;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'bookmark',
    item: { index: position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <TableRow
      ref={ref}
      className="cursor-move hover:bg-surface-secondary"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <TableCell className="w-[50%] px-4 py-4">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={row.tag}>
          {row.tag}
        </div>
      </TableCell>
      <TableCell className="w-[20%] px-4 py-4 text-center">{row.count}</TableCell>
      <TableCell className="w-[30%] px-4 py-4">
        <div className="flex gap-2">
          <EditBookmarkButton bookmark={row} tabIndex={0} />
          <DeleteBookmarkButton bookmark={row.tag} tabIndex={0} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default BookmarkTableRow;
