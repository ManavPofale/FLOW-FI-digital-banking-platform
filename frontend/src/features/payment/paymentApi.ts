import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
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
  tagTypes: ['Payment', 'QR'],
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation({
      query: (data) => ({
        url: '/payment/create-order',
        method: 'POST',
        body: data,
      }),
    }),
    verifyRazorpayPayment: builder.mutation({
      query: (data) => ({
        url: '/payment/verify',
        method: 'POST',
        body: data,
      }),
    }),
    getPersonalQR: builder.query({
      query: () => '/payment/qr/generate',
      providesTags: ['QR'],
    }),
    payViaQR: builder.mutation({
      query: (data) => ({
        url: '/payment/qr/pay',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { 
  useCreateRazorpayOrderMutation, 
  useVerifyRazorpayPaymentMutation, 
  useGetPersonalQRQuery, 
  usePayViaQRMutation 
} = paymentApi;
