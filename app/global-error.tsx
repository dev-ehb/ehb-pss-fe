'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Root-level error boundary. Catches crashes that escape the root layout
 * (so it must render its own <html> / <body>). This is the last safety net
 * before the user would otherwise see a blank white screen.
 *
 * NOTE: only shown in production builds — in dev, Next.js shows its overlay.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Central place to wire a real logger / Sentry later.
    console.error('[PSS] Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
            <p className="max-w-md text-sm text-gray-500">
              An unexpected error occurred. You can try again, or go back to the home page.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400">Error ID: {error.digest}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="rounded-md border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
