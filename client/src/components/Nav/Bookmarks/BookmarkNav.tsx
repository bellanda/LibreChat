import { Menu, MenuButton, MenuItems } from '@headlessui/react';
import { TooltipAnchor } from '@librechat/client';
import { BookmarkFilledIcon, BookmarkIcon } from '@radix-ui/react-icons';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { BookmarkContext } from '~/Providers/BookmarkContext';
import { useGetConversationTags } from '~/data-provider';
import { useLocalize } from '~/hooks';
import store from '~/store';
import { cn } from '~/utils';
import BookmarkNavItems from './BookmarkNavItems';

type BookmarkNavProps = {
  tags: string[];
  setTags: (tags: string[]) => void;
  isSmallScreen: boolean;
};

const BookmarkNav: FC<BookmarkNavProps> = ({ tags, setTags, isSmallScreen }: BookmarkNavProps) => {
  const localize = useLocalize();
  const { data } = useGetConversationTags();
  const conversation = useRecoilValue(store.conversationByIndex(0));
  const label = useMemo(
    () => (tags.length > 0 ? tags.join(', ') : localize('com_ui_bookmarks')),
    [tags, localize],
  );

  return (
    <Menu as="div" className="relative group">
      {({ open }) => (
        <>
          <TooltipAnchor
            description={label}
            render={
              <MenuButton
                id="bookmark-menu-button"
                aria-label={localize('com_ui_bookmarks')}
                className={cn(
                  'flex justify-center items-center',
                  'border-none size-10 text-text-primary hover:bg-accent hover:text-accent-foreground',
                  'p-2 rounded-full border-none hover:bg-surface-hover md:rounded-xl',
                  open ? 'bg-surface-hover' : '',
                )}
                data-testid="bookmark-menu"
              >
                {tags.length > 0 ? (
                  <BookmarkFilledIcon className="icon-lg text-text-primary" aria-hidden="true" />
                ) : (
                  <BookmarkIcon className="icon-lg text-text-primary" aria-hidden="true" />
                )}
              </MenuButton>
            }
          />
          <MenuItems
            anchor="bottom"
            className="absolute left-0 top-full z-[100] mt-1 translate-y-0 overflow-hidden rounded-lg bg-surface-secondary p-1.5 shadow-lg outline-none"
          >
            {data && conversation && (
              <BookmarkContext.Provider value={{ bookmarks: data.filter((tag) => tag.count > 0) }}>
                <BookmarkNavItems
                  // Currently selected conversation
                  conversation={conversation}
                  // List of selected tags(string)
                  tags={tags}
                  // When a user selects a tag, this `setTags` function is called to refetch the list of conversations for the selected tag
                  setTags={setTags}
                />
              </BookmarkContext.Provider>
            )}
          </MenuItems>
        </>
      )}
    </Menu>
  );
};

export default BookmarkNav;
