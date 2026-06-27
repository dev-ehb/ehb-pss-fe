'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { signOut } from 'next-auth/react';

// Logout double-click guard, SHARED across every consumer of this hook.
// There are multiple logout buttons (navbar dropdown + sidebar). The
// "signing out" flag lives in a module-level store so that clicking ANY of
// them disables ALL of them — otherwise each button kept its own local state
// and the user could fire signOut() a second time from the other button on a
// slow network. Stays "signing out" through the redirect so it can fire once.
let signingOut = false;
const listeners = new Set<() => void>();

function setSigningOut(value: boolean) {
  signingOut = value;
  listeners.forEach((notify) => notify());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return signingOut;
}

export function useSignOut(callbackUrl = '/login') {
  // getServerSnapshot returns false so SSR/first paint matches (hydration-safe).
  const isSigningOut = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const signOutNow = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut({ callbackUrl });
    } catch {
      // Only reset on failure — on success we stay disabled through the redirect.
      setSigningOut(false);
    }
  }, [callbackUrl]);

  return { signingOut: isSigningOut, signOutNow };
}
