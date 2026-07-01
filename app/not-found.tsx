'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Custom 404 page. Replaces Next.js' bare default so the user always has a
 * clear way back (dashboard or browser-back) instead of a dead end.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-6 text-center dark:bg-gray-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
        <FileQuestion className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">404</p>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Page not found</h1>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/overview">Go to dashboard</Link>
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    </div>
  );
}
