import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  onRetry?: () => void;
  title?: string;
  message?: string;
  className?: string;
}

// Reusable error state for a failed data fetch. Distinguishes a real load
// failure (this) from an empty result (the page's own "no data" view), and
// gives the user a Retry button instead of forcing a full-page refresh.
export function ErrorState({
  onRetry,
  title = "Couldn't load data",
  message = 'Something went wrong while loading this section. Please try again.',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-gray-200 p-10 text-center dark:border-gray-800',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={() => onRetry()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
