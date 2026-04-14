import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  TooltipAnchor,
} from '@librechat/client';
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from '@radix-ui/react-icons';
import { Column } from '@tanstack/react-table';
import { FilterX, ListFilter } from 'lucide-react';
import { TranslationKeys, useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface SortFilterHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  column: Column<TData, TValue>;
  filters?: Record<string, string[] | number[]>;
  valueMap?: Record<any, TranslationKeys>;
  ariaLabel?: string;
}

export function SortFilterHeader<TData, TValue>({
  column,
  title,
  className = '',
  filters,
  valueMap,
  ariaLabel,
}: SortFilterHeaderProps<TData, TValue>) {
  const localize = useLocalize();

  const sortState = column.getIsSorted();
  let ariaSort: 'ascending' | 'descending' | 'none' = 'none';
  if (sortState === 'desc') {
    ariaSort = 'descending';
  } else if (sortState === 'asc') {
    ariaSort = 'ascending';
  }

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <TooltipAnchor
          description={ariaLabel || title}
          side="top"
          render={
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                aria-sort={ariaSort}
                aria-label={ariaLabel}
                aria-pressed={column.getIsFiltered() ? 'true' : 'false'}
                aria-current={sortState ? 'true' : 'false'}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-2 py-0 text-xs transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-surface-hover sm:px-2 sm:py-2 sm:text-sm',
                  column.getIsFiltered() && 'border-b-2 border-b-border-xheavy',
                )}
              >
                <span>{title}</span>
                {column.getIsFiltered() ? (
                  <ListFilter className="icon-sm" aria-hidden="true" />
                ) : (
                  <ListFilter className="icon-sm text-text-secondary" aria-hidden="true" />
                )}
                {(() => {
                  const sortState = column.getIsSorted();
                  if (sortState === 'desc') {
                    return <ArrowDownIcon className="icon-sm" />;
                  }
                  if (sortState === 'asc') {
                    return <ArrowUpIcon className="icon-sm" />;
                  }
                  return <CaretSortIcon className="icon-sm" />;
                })()}
              </Button>
            </DropdownMenuTrigger>
          }
        />
        <DropdownMenuContent
          align="start"
          className="z-[1001] dark:border-gray-700 dark:bg-gray-850"
        >
          <DropdownMenuItem
            onClick={() => column.toggleSorting(false)}
            className="cursor-pointer text-text-primary"
          >
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {localize('com_ui_ascending')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.toggleSorting(true)}
            className="cursor-pointer text-text-primary"
          >
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            {localize('com_ui_descending')}
          </DropdownMenuItem>
          {filters && <DropdownMenuSeparator className="dark:bg-gray-500" />}
          {filters &&
            Object.entries(filters).map(([key, values]) =>
              values.map((value?: string | number) => {
                const translationKey = valueMap?.[value ?? ''];
                const filterValue =
                  translationKey != null && translationKey.length
                    ? localize(translationKey)
                    : String(value);
                if (!filterValue) {
                  return null;
                }
                const isActive = column.getFilterValue() === value;
                return (
                  <DropdownMenuItem
                    className={cn(
                      'cursor-pointer text-text-primary',
                      isActive && 'border-l-2 border-l-border-xheavy',
                    )}
                    key={`${key}-${value}`}
                    onClick={() => {
                      column.setFilterValue(value);
                    }}
                  >
                    <ListFilter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" />
                    {filterValue}
                  </DropdownMenuItem>
                );
              }),
            )}
          {filters && (
            <>
              <DropdownMenuSeparator className="dark:bg-gray-500" />
              <DropdownMenuItem
                className={
                  column.getIsFiltered()
                    ? 'cursor-pointer dark:text-white dark:hover:bg-gray-800'
                    : 'pointer-events-none opacity-30'
                }
                onClick={() => {
                  column.setFilterValue(undefined);
                }}
              >
                <FilterX className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                {localize('com_ui_show_all')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
