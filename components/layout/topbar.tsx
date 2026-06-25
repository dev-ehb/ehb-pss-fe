'use client';

import { usePathname } from 'next/navigation';
import { Bell, RefreshCw, Moon, Sun, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSignOut } from '@/lib/use-sign-out';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/store/hooks';
import { baseApi } from '@/lib/store/api/base-api';
import { useTheme } from '@/components/theme/ThemeProvider';
import { NavDropdown } from '@/components/layout/nav-dropdown';

const PAGE_TITLES: Record<string, string> = {
  '/overview': 'Overview',
  '/sq-requests': 'SQ Requests',
  '/edr': 'EDR Queue',
  '/franchise': 'Franchises',
  '/rule-engine': 'Rule Engine',
  '/criteria': 'Criteria',
  '/platforms': 'Platforms',
  '/audit': 'Audit Logs',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path + '/')) return title;
  }
  return 'PSS Admin';
}

const panelClass =
  'absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900 z-50';

export function Topbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { signingOut, signOutNow } = useSignOut();

  const handleRefresh = () => {
    dispatch(baseApi.util.invalidateTags(['SqRequest', 'EdrReview', 'Franchise', 'Stats']));
  };

  const name = session?.user?.name ?? 'EHB Admin';
  const email = session?.user?.email ?? 'admin@ehb.internal';
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{getPageTitle(pathname)}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">PSS Platform Support Services</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          title="Refresh data"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <NavDropdown
          triggerLabel="Notifications"
          triggerClassName="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          trigger={<Bell className="h-4 w-4" />}
          panelClassName={panelClass}
        >
          <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
          </div>
          <div className="px-3 py-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
          </div>
        </NavDropdown>

        {/* Account */}
        <NavDropdown
          triggerLabel="Account"
          triggerClassName="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700"
          trigger={
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {initial}
            </span>
          }
          panelClassName={panelClass}
        >
          <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{email}</p>
          </div>
          <button
            onClick={signOutNow}
            disabled={signingOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4" /> {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </NavDropdown>
      </div>
    </header>
  );
}
