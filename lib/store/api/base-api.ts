import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { getSession, signOut } from 'next-auth/react';
import { toast } from '@/components/ui/toaster';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_PSS_API_URL ?? 'http://localhost:3001',
  prepareHeaders: async (headers) => {
    // Use the admin key from next-auth session or env fallback
    const session = await getSession();
    const adminKey =
      (session as { adminKey?: string } | null)?.adminKey ??
      process.env.NEXT_PUBLIC_EHB_ADMIN_KEY ??
      '';
    if (adminKey) {
      headers.set('x-ehb-admin-key', adminKey);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// De-duplicate global error toasts: when several queries on one page fail at
// once (e.g. network down), act only ONCE per error type within a short window
// instead of showing 2-4 stacked toasts.
const TOAST_WINDOW_MS = 4000;
const lastShown: Record<string, number> = {};
function allowOnce(key: string): boolean {
  const now = Date.now();
  if (now - (lastShown[key] ?? 0) < TOAST_WINDOW_MS) return false;
  lastShown[key] = now;
  return true;
}

// Centralized auth/network error handling for every PSS API call:
//   401         -> session invalid/expired: toast + sign out to /login
//   403         -> forbidden (logged in, no permission): toast ONLY, never log out
//   FETCH_ERROR -> offline / network failure: toast
// Success responses pass through unchanged. Page-specific data errors (other
// 4xx/5xx) are left to each page's own error state (W3) to avoid toast spam.
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    if (status === 401) {
      if (allowOnce('401')) {
        toast({
          title: 'Session expired',
          description: 'Please log in again.',
          variant: 'destructive',
        });
        void signOut({ callbackUrl: '/login' });
      }
    } else if (status === 403) {
      // Authenticated but not permitted - do NOT log the user out.
      if (allowOnce('403')) {
        toast({
          title: 'Access denied',
          description: "You don't have permission to perform this action.",
          variant: 'destructive',
        });
      }
    } else if (status === 'FETCH_ERROR') {
      if (allowOnce('network')) {
        toast({
          title: 'Network error',
          description: 'Check your connection and try again.',
          variant: 'destructive',
        });
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'pssApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'SqRequest',
    'SqRecord',
    'EdrReview',
    'Franchise',
    'FranchiseReview',
    'PlatformRule',
    'CriteriaSet',
    'Platform',
    'AuditLog',
    'WebhookDelivery',
    'Stats',
    'VerificationApp',
    'VerificationRequest',
    'UserVerification',
  ],
  endpoints: () => ({}),
});
