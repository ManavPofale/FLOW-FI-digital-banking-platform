import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const kycApi = createApi({
  reducerPath: 'kycApi',
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
  tagTypes: ['KYC'],
  endpoints: (builder) => ({
    getKycStatus: builder.query({
      query: () => '/kyc/status',
      providesTags: ['KYC'],
    }),
    uploadKycDocuments: builder.mutation({
      query: (formData) => ({
        url: '/kyc/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['KYC'],
    }),
  }),
});

export const { useGetKycStatusQuery, useUploadKycDocumentsMutation } = kycApi;
