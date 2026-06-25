'use client';

import { useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';

// Guards logout against double-clicks (e.g. on slow networks). Stays
// "signing out" through the redirect so the button cannot fire signOut()
// more than once.
export function useSignOut(callbackUrl = '/login') {
  const [signingOut, setSigningOut] = useState(false);
  const signOutNow = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut({ callbackUrl });
    } catch {
      setSigningOut(false);
    }
  }, [signingOut, callbackUrl]);
  return { signingOut, signOutNow };
}
