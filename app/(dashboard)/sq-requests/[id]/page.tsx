'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetRequestByIdQuery } from '@/lib/store/api/sq.api';
import { useGetLogsByRequestQuery } from '@/lib/store/api/audit.api';
import { SqBadge } from '@/components/sq/sq-badge';
import { SqStatusPill } from '@/components/sq/sq-status-pill';
import { AuditActionBadge } from '@/components/audit/audit-action-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn, formatDate, flattenObject } from '@/lib/utils';
import {
  ArrowLeft,
  Shield,
  Building2,
  Hash,
  User,
  Globe,
  Layers,
  Calendar,
  CircleDot,
  CalendarCheck,
  Copy,
  Check,
  ImageOff,
} from 'lucide-react';
import Link from 'next/link';

/** Copy-to-clipboard button with a brief "copied" confirmation. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable — ignore */
        }
      }}
      title="Copy ID"
      className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

/** A label/value row with a leading muted icon. */
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Icon className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
        {label}
      </span>
      <span className="max-w-[55%] break-all text-right text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}

/** Entity image with graceful fallback for empty / broken sources. */
function EntityImage({ label, src, wide }: { label: string; src: string; wide?: boolean }) {
  const [failed, setFailed] = useState(false);
  const hasSrc = !!src && src.trim() !== '' && src !== '—';

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800',
        wide && 'sm:col-span-2',
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      {hasSrc && !failed ? (
        <a href={src} target="_blank" rel="noreferrer" className="mt-2 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={label}
            onError={() => setFailed(true)}
            className="h-auto w-full rounded-md border border-gray-200 bg-white dark:border-gray-700"
          />
        </a>
      ) : (
        <div className="mt-2 flex h-44 w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">No image provided</span>
        </div>
      )}
    </div>
  );
}

export default function SqRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: request, isLoading, isError, refetch } = useGetRequestByIdQuery(id ?? '');
  const { data: auditLogs, isLoading: auditLoading } = useGetLogsByRequestQuery(id ?? '');

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!request) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">SQ request not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const criteriaPercent =
    request.total_criteria > 0
      ? Math.round((request.criteria_met / request.total_criteria) * 100)
      : 0;

  const entityFields = request.entity_data ? flattenObject(request.entity_data) : [];

  // Surface the friendly fields (name, then description) above the rest (e.g. bio).
  const fieldRank = (key: string) => {
    const k = key.toLowerCase();
    if (/(display_name|business_name|shop_name|full_name|(^|\.)name)$/.test(k)) return 0;
    if (/description/.test(k)) return 1;
    return 2;
  };
  const orderedFields = [...entityFields].sort((a, b) => fieldRank(a.key) - fieldRank(b.key));

  // Friendly title from the entity payload, falling back to the entity type.
  const displayName =
    entityFields.find((f) =>
      /(^|\.)(display_name|business_name|shop_name|full_name|name)$/i.test(f.key),
    )?.value ?? request.entity_type;

  const sqLevel = request.sq_level_assigned ?? request.sq_level_calculated;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Hero header ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-white shadow-sm dark:border-gray-800 dark:from-blue-950/30 dark:via-gray-900 dark:to-gray-900">
        <div className="p-5 sm:p-6">
          {/* Top bar: back + status / SQ badges */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="-ml-2 text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <SqStatusPill status={request.status} />
              <SqBadge level={sqLevel} size="lg" />
            </div>
          </div>

          {/* Identity: icon + name */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                {displayName}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                <span className="capitalize">{request.entity_type}</span> · {request.platform_id}
              </p>
            </div>
          </div>

          {/* Request ID — full width so the entire ID stays visible on mobile */}
          <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-white/70 px-2 py-1 dark:border-gray-700 dark:bg-gray-800/60">
            <Hash className="h-3 w-3 shrink-0 text-gray-400" />
            <span className="break-all font-mono text-xs text-gray-600 dark:text-gray-300">
              {request.sq_request_id}
            </span>
            <CopyButton text={request.sq_request_id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Request details ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="-mt-1 divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow icon={Hash} label="Entity ID" value={request.entity_id} />
            <DetailRow
              icon={Layers}
              label="Entity Type"
              value={<span className="capitalize">{request.entity_type}</span>}
            />
            <DetailRow icon={User} label="User ID" value={request.user_id} />
            <DetailRow icon={Globe} label="Platform" value={request.platform_id} />
            <DetailRow
              icon={CircleDot}
              label="Status"
              value={<SqStatusPill status={request.status} />}
            />
            <DetailRow
              icon={Calendar}
              label="Submitted"
              value={formatDate(request.submitted_at)}
            />
            <DetailRow
              icon={CalendarCheck}
              label="Decided"
              value={request.decided_at ? formatDate(request.decided_at) : '—'}
            />
            <DetailRow
              icon={Building2}
              label="Assigned Franchise"
              value={request.assigned_franchise_id ?? '—'}
            />

            {request.rejection_reason && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                  Rejection Reason
                </p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {request.rejection_reason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── SQ Score ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SQ Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Criteria Met</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {request.criteria_met}
                  <span className="text-lg text-gray-400 dark:text-gray-500">
                    /{request.total_criteria}
                  </span>
                </p>
              </div>
              <SqBadge level={sqLevel} size="lg" />
            </div>

            <div className="space-y-1.5">
              <Progress value={criteriaPercent} className="h-3" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">{criteriaPercent}% satisfied</span>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {request.criteria_met} of {request.total_criteria}
                </span>
              </div>
            </div>

            {request.status === 'pending_edr' && (
              <Link href={`/edr/${request.sq_request_id}`} className="block">
                <Button className="w-full" variant="default">
                  <Shield className="mr-2 h-4 w-4" />
                  Open in EDR
                </Button>
              </Link>
            )}
            {request.status === 'pending_franchise' && request.assigned_franchise_id && (
              <Link href={`/franchise/${request.assigned_franchise_id}`} className="block">
                <Button className="w-full" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  View Franchise
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Entity Data ── */}
      {entityFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entity Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {orderedFields.map(({ key, value }) => {
                const isImageField =
                  /(cnic|facial|selfie|photo|proof|avatar|image|picture|document)/i.test(key);
                const looksLikeImageValue =
                  /^data:image\//.test(value) || /^https?:\/\/\S+$/.test(value);

                if (isImageField || looksLikeImageValue) {
                  // Document-style proofs read better full width; ID cards pair up 2-col.
                  const wide = /proof|document|certificate|bill|agreement|contract/i.test(key);
                  return <EntityImage key={key} label={key} src={value} wide={wide} />;
                }

                return (
                  <div
                    key={key}
                    className="flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {key}
                    </span>
                    <span className="mt-0.5 break-words text-sm text-gray-900 dark:text-gray-100">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Audit Trail ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !auditLogs || auditLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
              No audit events recorded
            </p>
          ) : (
            <div className="relative">
              <div className="absolute bottom-2 left-4 top-2 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-5">
                {auditLogs.map((log) => (
                  <div key={log._id} className="relative flex gap-4 pl-10">
                    <div className="absolute left-[11px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-900" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                        <AuditActionBadge action={log.action} />
                        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300">{log.reason}</p>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        by {log.performed_by}
                      </p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                            Metadata
                          </summary>
                          <pre className="mt-1 overflow-auto rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
