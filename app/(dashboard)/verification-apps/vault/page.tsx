'use client';

import { useState } from 'react';
import {
  useGetUserVaultQuery,
  useRevokeVaultMutation,
} from '@/lib/store/api/verification.api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ErrorState } from '@/components/ui/error-state';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { Vault as VaultIcon, Search, Ban } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  verified: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  pending_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  revoked: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function VaultPage() {
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');
  const { data: vault, isFetching, isError, refetch } = useGetUserVaultQuery(userId, { skip: !userId });
  const [revoke] = useRevokeVaultMutation();

  const onRevoke = async (appId: string) => {
    try {
      await revoke({ user_id: userId, app_id: appId, reason: 'Revoked by admin' }).unwrap();
      toast({ title: `Revoked ${appId}` });
    } catch {
      toast({ title: 'Revoke failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <VaultIcon className="h-4 w-4 text-indigo-500 shrink-0" />
        <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Verification Vault</h1>
      </div>

      <Card>
        <CardContent className="p-4 flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">User ID (EHB SSO user_id)</Label>
            <input
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="7c9e6679-7425-40de-944b-e07fc1f90ae7"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setUserId(input.trim())}
            />
          </div>
          <Button size="sm" onClick={() => setUserId(input.trim())} disabled={!input.trim()}>
            <Search className="h-4 w-4 mr-1" /> Look up
          </Button>
        </CardContent>
      </Card>

      {userId && (
        isError ? (
          <ErrorState onRetry={refetch} />
        ) : isFetching ? (
          <p className="text-sm text-gray-400 px-1">Loading…</p>
        ) : !vault || vault.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No vault entries for this user</p>
          </div>
        ) : (
          <div className="space-y-2">
            {vault.map((v) => (
              <Card key={v.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="font-mono text-sm font-medium">{v.app_id}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[v.status] ?? 'bg-gray-100 text-gray-500')}>
                    {v.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {v.expires_at ? `expires ${new Date(v.expires_at).toLocaleDateString()}` : 'no expiry'}
                  </span>
                  {v.reviewed_by && <span className="text-xs text-gray-400">by {v.reviewed_by}</span>}
                  {v.status === 'verified' && (
                    <Button size="sm" variant="outline" className="ml-auto text-red-600 border-red-200" onClick={() => onRevoke(v.app_id)}>
                      <Ban className="h-4 w-4 mr-1" /> Revoke
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
