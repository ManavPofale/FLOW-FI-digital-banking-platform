import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminStats', 'KycQueue'],
  endpoints: (builder) => ({
    getPlatformStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),
    getPendingKyc: builder.query({
      query: () => '/admin/kyc/pending',
      providesTags: ['KycQueue'],
    }),
    updateKycStatus: builder.mutation({
      query: ({ kycId, status }) => ({
        url: `/admin/kyc/${kycId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['KycQueue', 'AdminStats'],
    }),
  }),
});

export const { 
  useGetPlatformStatsQuery, 
  useGetPendingKycQuery, 
  useUpdateKycStatusMutation 
} = adminApi;
