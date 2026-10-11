import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const walletApi = createApi({
  reducerPath: 'walletApi',
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
  tagTypes: ['Wallet'],
  endpoints: (builder) => ({
    getWalletBalance: builder.query({
      query: () => '/wallet/balance',
      providesTags: ['Wallet'],
    }),
    addMoney: builder.mutation({
      query: (data) => ({
        url: '/wallet/add',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),
    withdrawMoney: builder.mutation({
      query: (data) => ({
        url: '/wallet/withdraw',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),
    transferMoney: builder.mutation({
      query: (data) => ({
        url: '/wallet/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet'],
    }),
  }),
});

export const { 
  useGetWalletBalanceQuery, 
  useAddMoneyMutation, 
  useWithdrawMoneyMutation, 
  useTransferMoneyMutation 
} = walletApi;
