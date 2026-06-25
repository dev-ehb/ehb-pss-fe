'use client';

import { useEffect } from 'react';
import { toast } from '@/components/ui/toaster';

// Shows the post-login welcome toast once the dashboard has actually loaded.
// The login page sets the 'pss_welcome' flag; we read + clear it here so the
// toast appears after navigation completes, not on the login screen.
export function WelcomeToast() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('pss_welcome') === '1') {
      sessionStorage.removeItem('pss_welcome');
      toast({ title: 'Signed in', description: 'Welcome to PSS Admin.' });
    }
  }, []);
  return null;
}
