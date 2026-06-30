'use client';

import { useGetPendingRequestsQuery } from '@/lib/store/api/sq.api';
import { useGetEdrQueueQuery } from '@/lib/store/api/edr.api';
import { useGetAllFranchisesQuery } from '@/lib/store/api/franchise.api';
import { useGetAllPlatformsQuery } from '@/lib/store/api/platforms.api';
import { useSearchLogsQuery } from '@/lib/store/api/audit.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { RefreshButton } from '@/components/ui/refresh-button';
import { AuditActionBadge } from '@/components/audit/audit-action-badge';
import { SqStatusPill } from '@/components/sq/sq-status-pill';
import { formatDate } from '@/lib/utils';
import { FileSearch, Shield, Building2, Globe, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  color,
  isLoading,
  isError,
  onRetry,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}) {
  const body = (
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4 sm:p-6">
        {/* Title + icon row — icon (tallest element) keeps the number below aligned across cards */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>

        {/* Value / state — its own line so the number bottom-aligns across the grid */}
        <div className="mt-2 sm:mt-3">
          {isError ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                onRetry?.();
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          ) : isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // On error the card is not a navigation link — only Retry is interactive.
  if (isError) return body;
  return (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  );
}

export default function OverviewPage() {
  const {
    data: sqData,
    isLoading: sqLoading,
    isFetching: sqFetching,
    isError: sqErr,
    refetch: sqRefetch,
  } = useGetPendingRequestsQuery({ status: 'pending', page: 1, limit: 1 });

  const {
    data: edrData,
    isLoading: edrLoading,
    isError: edrErr,
    refetch: edrRefetch,
  } = useGetEdrQueueQuery({ status: 'pending', page: 1, limit: 1 });

  const {
    data: franchiseData,
    isLoading: franchiseLoading,
    isError: franchiseErr,
    refetch: franchiseRefetch,
  } = useGetAllFranchisesQuery({ page: 1, limit: 1 });

  const {
    data: platforms,
    isLoading: platformsLoading,
    isFetching: platformsFetching,
    isError: platformsErr,
    refetch: platformsRefetch,
  } = useGetAllPlatformsQuery();

  const {
    data: auditData,
    isLoading: auditLoading,
    isFetching: auditFetching,
    isError: auditErr,
    refetch: auditRefetch,
  } = useSearchLogsQuery({ page: 1, limit: 10 });

  // Sum pending franchise reviews across all franchises
  const {
    data: franchiseListData,
    isError: franchiseListErr,
    refetch: franchiseListRefetch,
  } = useGetAllFranchisesQuery({ page: 1, limit: 50 });
  const pendingFranchiseReviews =
    franchiseListData?.data?.reduce((sum, f) => sum + (f.pending_review_count ?? 0), 0) ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats grid — each card handles its own error independently */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Pending SQ Requests"
          value={sqData?.total ?? 0}
          icon={FileSearch}
          href="/sq-requests"
          color="bg-blue-600"
          isLoading={sqLoading}
          isError={sqErr}
          onRetry={sqRefetch}
        />
        <StatCard
          title="Pending EDR Reviews"
          value={edrData?.total ?? 0}
          icon={Shield}
          href="/edr"
          color="bg-red-500"
          isLoading={edrLoading}
          isError={edrErr}
          onRetry={edrRefetch}
        />
        <StatCard
          title="Pending Franchise Reviews"
          value={franchiseLoading ? '…' : pendingFranchiseReviews}
          icon={Building2}
          href="/franchise"
          color="bg-orange-500"
          isLoading={franchiseLoading}
          isError={franchiseErr || franchiseListErr}
          onRetry={() => {
            franchiseRefetch();
            franchiseListRefetch();
          }}
        />
        <StatCard
          title="Registered Platforms"
          value={platforms?.length ?? 0}
          icon={Globe}
          href="/platforms"
          color="bg-green-600"
          isLoading={platformsLoading}
          isError={platformsErr}
          onRetry={platformsRefetch}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent audit activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Recent Audit Activity
              </CardTitle>
              <div className="flex items-center gap-1">
                <RefreshButton onClick={auditRefetch} busy={auditFetching} title="Refresh activity" />
                <Link href="/audit" className="text-xs text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {auditErr ? (
                <ErrorState onRetry={auditRefetch} className="border-0 py-8" />
              ) : auditLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : auditData?.data?.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No recent activity</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {auditData?.data?.slice(0, 10).map((log, idx) => (
                    <div
                      key={log._id}
                      className={`${idx >= 5 ? 'hidden sm:flex' : 'flex'} flex-col gap-1 rounded-lg p-2.5 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-800 sm:flex-row sm:items-start sm:gap-3`}
                    >
                      {/* Badge sits on top on mobile (saves horizontal space), inline on sm+ */}
                      <div className="flex-shrink-0 sm:mt-0.5">
                        <AuditActionBadge action={log.action} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{log.reason}</p>
                        {/* entity_id truncates (long UUID), but platform + date stay visible */}
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <span className="truncate">{log.entity_id}</span>
                          <span className="shrink-0">· {log.platform_id} · {formatDate(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick stats panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                Active Platforms
              </CardTitle>
              <RefreshButton onClick={platformsRefetch} busy={platformsFetching} title="Refresh platforms" />
            </CardHeader>
            <CardContent>
              {platformsErr ? (
                <ErrorState onRetry={platformsRefetch} className="border-0 py-8" />
              ) : platformsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {platforms
                    ?.filter((p) => p.status === 'active')
                    .slice(0, 6)
                    .map((platform) => (
                      <Link
                        key={platform.platform_id}
                        href={`/platforms/${platform.platform_id}`}
                        className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {platform.platform_name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{platform.platform_id}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 text-xs font-medium">
                          Active
                        </span>
                      </Link>
                    ))}
                  {(platforms?.filter((p) => p.status === 'active').length ?? 0) === 0 && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                      No active platforms
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent SQ Requests</CardTitle>
              <RefreshButton onClick={sqRefetch} busy={sqFetching} title="Refresh requests" />
            </CardHeader>
            <CardContent>
              {sqErr ? (
                <ErrorState onRetry={sqRefetch} className="border-0 py-8" />
              ) : sqLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-2">
                  {sqData?.data?.slice(0, 5).map((req) => (
                    <Link
                      key={req._id}
                      href={`/sq-requests/${req.sq_request_id}`}
                      className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                          {req.entity_id}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{req.entity_type}</p>
                      </div>
                      <SqStatusPill status={req.status} />
                    </Link>
                  ))}
                  {(sqData?.data?.length ?? 0) === 0 && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No pending requests</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
