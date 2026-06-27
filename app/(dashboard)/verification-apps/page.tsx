'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useGetVerificationAppsQuery,
  useCreateVerificationAppMutation,
  useUpdateVerificationAppMutation,
} from '@/lib/store/api/verification.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { ShieldCheck, Plus, Power, PowerOff, ClipboardCheck } from 'lucide-react';

function NewAppForm({ onClose }: { onClose: () => void }) {
  const [appId, setAppId] = useState('');
  const [name, setName] = useState('');
  const [validityDays, setValidityDays] = useState('365');
  const [createApp, { isLoading }] = useCreateVerificationAppMutation();

  const handleCreate = async () => {
    if (!appId.trim() || !name.trim()) return;
    try {
      await createApp({
        app_id: appId.trim(),
        name: name.trim(),
        engine: 'manual_review',
        category: 'identity',
        validity_days: validityDays ? Number(validityDays) : null,
        reusable: true,
        active: true,
        capture_spec: { selfie: true, liveness: ['blink', 'turn_head'], max_attempts: 3 },
      }).unwrap();
      toast({ title: 'Verification app created' });
      onClose();
    } catch {
      toast({ title: 'Create failed (does app_id already exist?)', variant: 'destructive' });
    }
  };

  return (
    <Card className="border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">App ID</Label>
            <input
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="facial"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Name</Label>
            <input
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Facial Verification"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Validity (days, blank = never)</Label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="365"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={!appId.trim() || !name.trim() || isLoading}>
              {isLoading ? 'Creating…' : 'Create'}
            </Button>
            <Button size="sm" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">Engine defaults to <span className="font-mono">manual_review</span> (a PSS admin approves each submission).</p>
      </CardContent>
    </Card>
  );
}

export default function VerificationAppsPage() {
  const { data: apps, isLoading, isError, refetch } = useGetVerificationAppsQuery();
  const [updateApp] = useUpdateVerificationAppMutation();
  const [addingNew, setAddingNew] = useState(false);

  const toggleActive = async (appId: string, active: boolean) => {
    try {
      await updateApp({ app_id: appId, body: { active: !active } }).unwrap();
      toast({ title: `App ${!active ? 'activated' : 'deactivated'}` });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
        <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Verification Apps</h1>
        <Link
          href="/verification-apps/review"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ClipboardCheck className="h-4 w-4" /> Review Queue
        </Link>
        <Button size="sm" onClick={() => setAddingNew(true)}>
          <Plus className="h-4 w-4 mr-1" /> New App
        </Button>
      </div>

      {addingNew && <NewAppForm onClose={() => setAddingNew(false)} />}

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : !apps || apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-20 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No verification apps yet</p>
          <p className="text-sm text-gray-400 mt-1">Create one (e.g. <span className="font-mono">facial</span>), then attach it as a criterion.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{app.name}</CardTitle>
                  <span className="font-mono text-xs text-gray-400">{app.app_id}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium',
                    app.active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400')}>
                    {app.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toggleActive(app.app_id, app.active)}>
                  {app.active ? <PowerOff className="h-4 w-4 text-gray-400" /> : <Power className="h-4 w-4 text-green-600" />}
                </Button>
              </CardHeader>
              <CardContent className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4">
                <span><span className="font-medium text-gray-700 dark:text-gray-300">Engine:</span> {app.engine}</span>
                <span><span className="font-medium text-gray-700 dark:text-gray-300">Validity:</span> {app.validity_days ? `${app.validity_days} days` : 'never expires'}</span>
                <span><span className="font-medium text-gray-700 dark:text-gray-300">Reusable:</span> {app.reusable ? 'yes' : 'no'}</span>
                <span><span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {app.category}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
