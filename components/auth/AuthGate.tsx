'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Auth gate for the whole protected dashboard. Content is NOT rendered until
 * the next-auth session is actually verified:
 *   - 'loading'         -> verifying spinner (also covers slow / blocked auth)
 *   - 'unauthenticated' -> redirect to /login
 *   - 'authenticated'   -> render the page
 * Reactive: if the session later becomes invalid, the gate closes again.
 * Route protection is also enforced server-side by middleware; this is the
 * client gate so no sensitive page paints before auth has been confirmed.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Verifying session…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
