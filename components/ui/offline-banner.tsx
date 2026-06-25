'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

// Shown when the browser goes offline DURING a session. Renders in normal flow
// (NOT fixed) so it takes its own space at the top of the content column and
// pushes the navbar down instead of overlaying it. Starts "online" (false) so
// server and first client render match (hydration-safe); real status read after
// mount via navigator.onLine.
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full shrink-0 items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-sm font-medium text-white"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>You are offline. Some features may not work until your connection returns.</span>
    </div>
  );
}
