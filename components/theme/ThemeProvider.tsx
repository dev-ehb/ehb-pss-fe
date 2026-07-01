'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

// The View Transitions API isn't in every TS lib.dom yet — narrow it locally.
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('pss-theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    applyThemeClass(initial);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';

    try {
      localStorage.setItem('pss-theme', next);
    } catch {
      /* localStorage can throw in private mode — ignore, the class still flips */
    }

    // Flip the class + the React icon together, forced synchronously, so the
    // View Transition captures the finished light/dark frame in one snapshot.
    const commit = () => {
      flushSync(() => setTheme(next));
      applyThemeClass(next);
    };

    const doc = document as ViewTransitionDocument;
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Crossfade the whole page between two COMPLETE snapshots (GPU-composited),
    // so light<->dark dissolves cleanly instead of flashing white borders or
    // repainting region-by-region (sidebar lagging the content). Falls back to
    // an instant swap where the API is unavailable or motion is reduced.
    if (!prefersReduced && typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(commit);
    } else {
      commit();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
