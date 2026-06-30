'use client';

import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Small per-section refresh control. Drop it in any card/section header and pass
 * that section's RTK Query `refetch` so the user can pull fresh data for just
 * that component, any time — independent of the global topbar refresh.
 */
export function RefreshButton({
  onClick,
  busy,
  title = 'Refresh',
  className,
}: {
  onClick: () => void;
  busy?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200',
        className,
      )}
    >
      <RefreshCw className={cn('h-3.5 w-3.5', busy && 'animate-spin')} />
    </button>
  );
}
