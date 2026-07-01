import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { WelcomeToast } from '@/components/layout/welcome-toast';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { NavigationLoader } from '@/components/layout/navigation-loader';
import { AuthGate } from '@/components/auth/AuthGate';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Full-width offline banner - spans above sidebar + content */}
      <OfflineBanner />
      <WelcomeToast />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Fixed sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <Breadcrumb />
          {/*
            `relative` is required so NavigationLoader's `absolute inset-0`
            is scoped to this content area - not the full viewport.
          */}
          <main className="relative flex-1 overflow-y-auto">
            <NavigationLoader />
            <div className="p-3 sm:p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
