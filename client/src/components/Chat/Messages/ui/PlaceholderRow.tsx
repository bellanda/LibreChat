import { memo } from 'react';
import { cn } from '~/utils';

/** Skeleton lines shown while the assistant message is streaming (typing indicator). */
const StreamingSkeleton = () => (
  <div className="mt-1 flex min-h-[27px] flex-col gap-2" aria-hidden="true">
    <div className="h-3 w-full max-w-[85%] animate-pulse rounded bg-border-medium" />
    <div className="h-3 w-[80%] max-w-[70%] animate-pulse rounded bg-border-medium" />
    <div className="h-3 w-[60%] max-w-[50%] animate-pulse rounded bg-border-medium" />
  </div>
);

const PlaceholderRow = memo(({ isCard }: { isCard?: boolean }) => {
  if (isCard === false) {
    return null;
  }
  return (
    <div className={cn('mt-1 min-h-[27px]')}>
      <StreamingSkeleton />
    </div>
  );
});

export default PlaceholderRow;
