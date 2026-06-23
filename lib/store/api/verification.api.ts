import { baseApi } from './base-api';
import type {
  VerificationApp,
  UserVerification,
  VerificationRequest,
} from '@/types/pss.types';

interface CreateAppBody {
  app_id: string;
  name: string;
  description?: string;
  category?: string;
  engine?: string;
  config?: Record<string, unknown>;
  capture_spec?: Record<string, unknown>;
  validity_days?: number | null;
  reusable?: boolean;
  active?: boolean;
}

type UpdateAppBody = Partial<Omit<CreateAppBody, 'app_id'>>;

export const verificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVerificationApps: build.query<VerificationApp[], { active?: boolean } | void>({
      query: (args) => {
        const qs = new URLSearchParams();
        if (args && typeof args.active === 'boolean') qs.set('active', String(args.active));
        const s = qs.toString();
        return `/verification/apps${s ? `?${s}` : ''}`;
      },
      providesTags: ['VerificationApp'],
    }),

    createVerificationApp: build.mutation<VerificationApp, CreateAppBody>({
      query: (body) => ({ url: '/verification/apps', method: 'POST', body }),
      invalidatesTags: ['VerificationApp'],
    }),

    updateVerificationApp: build.mutation<VerificationApp, { app_id: string; body: UpdateAppBody }>({
      query: ({ app_id, body }) => ({ url: `/verification/apps/${app_id}`, method: 'PATCH', body }),
      invalidatesTags: ['VerificationApp'],
    }),

    getVerificationRequests: build.query<
      VerificationRequest[],
      { status?: string; app_id?: string } | void
    >({
      query: (args) => {
        const qs = new URLSearchParams();
        if (args?.status) qs.set('status', args.status);
        if (args?.app_id) qs.set('app_id', args.app_id);
        const s = qs.toString();
        return `/verification/requests${s ? `?${s}` : ''}`;
      },
      providesTags: ['VerificationRequest'],
    }),

    getVerificationRequest: build.query<VerificationRequest, string>({
      query: (id) => `/verification/requests/${id}`,
      providesTags: ['VerificationRequest'],
    }),

    approveVerificationRequest: build.mutation<
      { success: boolean },
      { id: string; notes?: string; staff_id?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/verification/requests/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VerificationRequest', 'UserVerification'],
    }),

    rejectVerificationRequest: build.mutation<
      { success: boolean },
      { id: string; reason: string; staff_id?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/verification/requests/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['VerificationRequest', 'UserVerification'],
    }),

    getUserVault: build.query<UserVerification[], string>({
      query: (user_id) => `/verification/vault?user_id=${encodeURIComponent(user_id)}`,
      providesTags: ['UserVerification'],
    }),

    revokeVault: build.mutation<
      { success: boolean },
      { user_id: string; app_id: string; reason: string }
    >({
      query: ({ user_id, app_id, reason }) => ({
        url: `/verification/vault/${user_id}/${app_id}/revoke`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['UserVerification'],
    }),
  }),
});

export const {
  useGetVerificationAppsQuery,
  useCreateVerificationAppMutation,
  useUpdateVerificationAppMutation,
  useGetVerificationRequestsQuery,
  useGetVerificationRequestQuery,
  useApproveVerificationRequestMutation,
  useRejectVerificationRequestMutation,
  useGetUserVaultQuery,
  useRevokeVaultMutation,
} = verificationApi;
