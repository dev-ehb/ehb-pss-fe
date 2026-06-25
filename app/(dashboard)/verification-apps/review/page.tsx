'use client';

import { useState } from 'react';
import {
  useGetVerificationRequestsQuery,
  useApproveVerificationRequestMutation,
  useRejectVerificationRequestMutation,
} from '@/lib/store/api/verification.api';
import type { VerificationRequest } from '@/types/pss.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { ClipboardCheck, Check, X, User } from 'lucide-react';

const STATUSES = ['needs_review', 'passed', 'failed', 'pending'];

function isDataUrl(s?: string | null) {
  return !!s && s.startsWith('data:image');
}

function ReviewDetail({ req }: { req: VerificationRequest }) {
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [approve, { isLoading: approving }] = useApproveVerificationRequestMutation();
  const [reject, { isLoading: rejectingReq }] = useRejectVerificationRequestMutation();
  const decided = req.status === 'passed' || req.status === 'failed';

  const onApprove = async () => {
    try { await approve({ id: req.id }).unwrap(); toast({ title: 'Approved — vault verified' }); }
    catch { toast({ title: 'Approve failed', variant: 'destructive' }); }
  };
  const onReject = async () => {
    if (!reason.trim()) return;
    try { await reject({ id: req.id, reason: reason.trim() }).unwrap(); toast({ title: 'Rejected' }); setRejecting(false); setReason(''); }
    catch { toast({ title: 'Reject failed', variant: 'destructive' }); }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          {req.app_id} · <span className="font-mono text-xs">{req.user_id}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-400">Submitted proof</Label>
            {isDataUrl(req.proof_ref) ? (
              <img src={req.proof_ref as string} alt="proof" className="mt-1 max-h-64 rounded-lg border border-gray-200 dark:border-gray-700 object-contain" />
            ) : (
              <p className="mt-1 text-xs font-mono break-all text-gray-600 dark:text-gray-300">
                {req.proof_ref ?? '(no proof_ref)'}
              </p>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Platform:</span> {req.platform_id}</p>
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Origin:</span> {req.origin_entity ?? '—'}</p>
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Status:</span> {req.status}</p>
            <p><span className="font-medium text-gray-700 dark:text-gray-300">Created:</span> {new Date(req.created_at).toLocaleString()}</p>
            {req.notes && <p><span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span> {req.notes}</p>}
            <p className="text-amber-600 dark:text-amber-400">Compare the selfie to the user&apos;s CNIC before deciding.</p>
          </div>
        </div>

        {!decided && (
          <div className="flex flex-col gap-2">
            {!rejecting ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={onApprove} disabled={approving} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-1" /> {approving ? 'Approving…' : 'Approve'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRejecting(true)} className="text-red-600 border-red-200">
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Rejection reason (sent to the user)…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={onReject} disabled={!reason.trim() || rejectingReq} className="bg-red-600 hover:bg-red-700">
                    {rejectingReq ? 'Rejecting…' : 'Confirm Reject'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setRejecting(false); setReason(''); }}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FacialReviewPage() {
  const [status, setStatus] = useState('needs_review');
  const { data: requests, isLoading, isError, refetch } = useGetVerificationRequestsQuery({ status });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <ClipboardCheck className="h-4 w-4 text-indigo-500 shrink-0" />
        <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Facial Review Queue</h1>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44 ml-auto"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}</div>
      ) : !requests || requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-20 text-center">
          <ClipboardCheck className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Nothing to review</p>
          <p className="text-sm text-gray-400 mt-1">No <span className="font-mono">{status}</span> requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => <ReviewDetail key={req.id} req={req} />)}
        </div>
      )}
    </div>
  );
}
