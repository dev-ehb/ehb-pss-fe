'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Open/close state for the mobile sidebar drawer, shared across components.
// The hamburger lives in <Topbar> and the drawer is <Sidebar> — they are
// siblings in the dashboard layout, so the state lives in a tiny module-level
// store (same pattern as use-sign-out) instead of threading props through the
// server-component layout. Desktop (lg+) ignores this — the sidebar is static.
let open = false;
const listeners = new Set<() => void>();

function setOpen(value: boolean) {
  open = value;
  listeners.forEach((notify) => notify());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return open;
}

export function useMobileSidebar() {
  // getServerSnapshot returns false so SSR/first paint is closed (hydration-safe).
  const isOpen = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);

  return { isOpen, openSidebar, closeSidebar };
}
