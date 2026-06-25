'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetAllPlatformsQuery } from '@/lib/store/api/platforms.api';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Zap } from 'lucide-react';

export default function RuleEngineIndexPage() {
  const router = useRouter();
  const { data: platforms, isLoading, isError, refetch } = useGetAllPlatformsQuery();

  useEffect(() => {
    const first = platforms?.[0];
    if (first) {
      router.replace(`/rule-engine/${first.platform_id}`);
    }
  }, [platforms, router]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!platforms || platforms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-20 text-center">
        <Zap className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No platforms registered</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Register a platform first to configure rules
        </p>
      </div>
    );
  }

  return null;
}
