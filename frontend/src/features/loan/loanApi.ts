import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const loanApi = createApi({
  reducerPath: 'loanApi',
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
  tagTypes: ['Loan', 'Profile'],
  endpoints: (builder) => ({
    calculateTrustScore: builder.mutation({
      query: () => ({
        url: '/loan/calculate-score',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'], // This updates the trust score in Profile
    }),
    applyForLoan: builder.mutation({
      query: (data) => ({
        url: '/loan/apply',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Loan', 'Profile'], // Refreshes wallet balance potentially
    }),
    getMyLoans: builder.query({
      query: () => '/loan/my-loans',
      providesTags: ['Loan'],
    }),
  }),
});

export const { 
  useCalculateTrustScoreMutation, 
  useApplyForLoanMutation, 
  useGetMyLoansQuery 
} = loanApi;
