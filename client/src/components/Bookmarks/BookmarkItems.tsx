import type { FC } from 'react';
import { useBookmarkContext } from '~/Providers/BookmarkContext';
import BookmarkItem from './BookmarkItem';
import BookmarkItemWithActions from './BookmarkItemWithActions';
interface BookmarkItemsProps {
  tags: string[];
  handleSubmit: (tag?: string) => void;
  header: React.ReactNode;
  showActions?: boolean;
}

const BookmarkItems: FC<BookmarkItemsProps> = ({
  tags,
  handleSubmit,
  header,
  showActions = false,
}) => {
  const { bookmarks } = useBookmarkContext();

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {header}
      {bookmarks.length > 0 && <div className="my-1.5 h-px" role="none" />}
      {bookmarks.map((bookmark, i) =>
        showActions ? (
          <BookmarkItemWithActions
            key={`${bookmark._id ?? bookmark.tag}-${i}`}
            bookmark={bookmark}
            tag={bookmark.tag}
            selected={tags.includes(bookmark.tag)}
            handleSubmit={handleSubmit}
            showActions={showActions}
          />
        ) : (
          <BookmarkItem
            key={`${bookmark._id ?? bookmark.tag}-${i}`}
            tag={bookmark.tag}
            selected={tags.includes(bookmark.tag)}
            handleSubmit={handleSubmit}
          />
        ),
      )}
    </div>
  );
};

export default BookmarkItems;
