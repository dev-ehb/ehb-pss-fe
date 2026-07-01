'use client';

import { useEffect, useRef, useState } from 'react';

interface NavDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
  panelClassName?: string;
}

// Lightweight click-to-open dropdown with click-outside + Escape to close.
// No extra dependencies — used for the topbar account / notifications menus.
export function NavDropdown({
  trigger,
  children,
  triggerClassName,
  triggerLabel,
  panelClassName,
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <div role="menu" className={panelClassName} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}
