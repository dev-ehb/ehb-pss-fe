import { baseApi } from './base-api';
import type {
  EdrReview,
  EdrFullDetail,
  PaginatedResponse,
  SqLevel,
} from '@/types/pss.types';

interface GetEdrQueueParams {
  platform_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface EdrDecisionBody {
  decision: 'approved' | 'conditional' | 'rejected' | 'changes_requested';
  sq_level_assigned?: SqLevel;
  rejection_reason?: string;
  review_message?: string;
  requested_items?: string[];
  reviewed_by: string;
}

interface EdrOverrideBody {
  sq_level_assigned?: SqLevel;
  rejection_reason?: string;
  reviewed_by: string;
  override_notes: string;
}

interface EdrEditBody {
  entity_data: Record<string, unknown>;
  edited_by: string;
}

export interface SubmissionSnapshot {
  id: string;
  status: string;
  sq_level_assigned?: number | null;
  sq_level_calculated?: number | null;
  entity_data?: Record<string, unknown>;
  review_message?: string | null;
  requested_items?: string[];
  decided_by?: string | null;
  created_at: string;
  decided_at?: string | null;
}
export interface EntitySubmissionHistory {
  entity_id: string;
  platform_id: string;
  changes_requested_count: number;
  submissions: SubmissionSnapshot[];
}

export const edrApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEdrQueue: build.query<PaginatedResponse<EdrReview>, GetEdrQueueParams>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params.platform_id) qs.set('platform_id', params.platform_id);
        if (params.status) qs.set('status', params.status);
        qs.set('page', String(params.page ?? 1));
        qs.set('limit', String(params.limit ?? 20));
        return `/edr/queue?${qs.toString()}`;
      },
      providesTags: ['EdrReview'],
    }),

    getEdrReviewDetail: build.query<EdrFullDetail, string>({
      query: (sq_request_id) => `/edr/review/${sq_request_id}`,
      providesTags: (_result, _error, id) => [{ type: 'EdrReview', id }],
    }),

    getEntityHistory: build.query<
      EntitySubmissionHistory,
      { entity_id: string; platform_id: string }
    >({
      query: ({ entity_id, platform_id }) =>
        `/sq/requests/by-entity/${entity_id}?platform_id=${platform_id}`,
      providesTags: (_r, _e, { entity_id }) => [{ type: 'SqRequest', id: entity_id }],
    }),

    submitEdrDecision: build.mutation<
      EdrReview,
      { sq_request_id: string; body: EdrDecisionBody }
    >({
      query: ({ sq_request_id, body }) => ({
        url: `/edr/review/${sq_request_id}/decide`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { sq_request_id }) => [
        { type: 'EdrReview', id: sq_request_id },
        'EdrReview',
        'SqRequest',
      ],
    }),

    submitEdrOverride: build.mutation<
      EdrReview,
      { sq_request_id: string; body: EdrOverrideBody }
    >({
      query: ({ sq_request_id, body }) => ({
        url: `/edr/review/${sq_request_id}/override`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { sq_request_id }) => [
        { type: 'EdrReview', id: sq_request_id },
        'EdrReview',
        'SqRequest',
      ],
    }),

    editEdrRequest: build.mutation<
      { message: string },
      { sq_request_id: string; body: EdrEditBody }
    >({
      query: ({ sq_request_id, body }) => ({
        url: `/edr/review/${sq_request_id}/edit`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { sq_request_id }) => [
        { type: 'EdrReview', id: sq_request_id },
        { type: 'SqRequest', id: sq_request_id },
      ],
    }),
  }),
});

export const {
  useGetEdrQueueQuery,
  useGetEdrReviewDetailQuery,
  useSubmitEdrDecisionMutation,
  useSubmitEdrOverrideMutation,
  useEditEdrRequestMutation,
  useGetEntityHistoryQuery,
} = edrApi;
