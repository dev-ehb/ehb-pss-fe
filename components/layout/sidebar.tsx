'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Shield,
  Building2,
  Settings2,
  ClipboardList,
  ShieldCheck,
  Globe,
  ScrollText,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useSignOut } from '@/lib/use-sign-out';
import { useMobileSidebar } from '@/lib/use-mobile-sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',     href: '/overview',     icon: LayoutDashboard },
  { label: 'SQ Requests',  href: '/sq-requests',  icon: FileSearch },
  { label: 'EDR Queue',    href: '/edr',          icon: Shield },
  { label: 'Franchises',   href: '/franchise',    icon: Building2 },
  { label: 'Rule Engine',  href: '/rule-engine',  icon: Settings2 },
  { label: 'Criteria',     href: '/criteria',     icon: ClipboardList },
  { label: 'Verification', href: '/verification-apps', icon: ShieldCheck },
  { label: 'Platforms',    href: '/platforms',    icon: Globe },
  { label: 'Audit Logs',   href: '/audit',        icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { signingOut, signOutNow } = useSignOut();
  const { isOpen, closeSidebar } = useMobileSidebar();

  return (
    <>
      {/* Mobile backdrop — closes the drawer on tap (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'flex h-full flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-200',
          // Mobile: off-canvas drawer that slides in over the content.
          'fixed inset-y-0 left-0 z-50 w-[260px] lg:static lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static, collapsible width.
          collapsed ? 'lg:w-[60px]' : 'lg:w-[220px]',
        )}
      >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-gray-100 dark:border-gray-800 px-4',
          collapsed ? 'justify-center' : 'gap-2.5',
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-xs">
          P
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              PSS Admin
            </p>
            <p className="truncate text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
              EHB Personal Security Services
            </p>
          </div>
        )}

        {/* Mobile close button (drawer only) */}
        <button
          onClick={closeSidebar}
          aria-label="Close menu"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/overview' && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500',
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-2 py-2 space-y-0.5">
        {/* Sign Out */}
        <button
          onClick={signOutNow}
          disabled={signingOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
          {!collapsed && <span>{signingOut ? 'Signing out…' : 'Sign Out'}</span>}
        </button>

        {/* Collapse toggle — desktop only (mobile uses the drawer) */}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'hidden w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors lg:flex',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
