'use client';

import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Active per-page verification for SENSITIVE pages (e.g. a platform's API key /
 * webhook secrets). Unlike the dashboard-wide AuthGate (which verifies once on
 * load), this re-checks the session with a fresh getSession() EVERY time the
 * page mounts (i.e. on each navigation) and does NOT render the page until it
 * resolves:
 *   - pending / slow / blocked auth -> stay on the spinner (content stays hidden)
 *   - no session                    -> redirect to /login
 *   - valid session                 -> render the children
 */
export function VerifyGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let active = true;
    getSession()
      .then((session) => {
        if (!active) return;
        if (!session) {
          router.replace('/login');
        } else {
          setVerified(true);
        }
      })
      .catch(() => {
        // Verification failed (offline / blocked) — keep the content hidden.
      });
    return () => {
      active = false;
    };
  }, [router]);

  if (!verified) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Verifying access…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
