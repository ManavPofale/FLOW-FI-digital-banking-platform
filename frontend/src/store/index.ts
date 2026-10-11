import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { profileApi } from '../features/profile/profileApi';
import { kycApi } from '../features/kyc/kycApi';
import { walletApi } from '../features/wallet/walletApi';
import { paymentApi } from '../features/payment/paymentApi';
import { loanApi } from '../features/loan/loanApi';
import { adminApi } from '../features/admin/adminApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [kycApi.reducerPath]: kycApi.reducer,
    [walletApi.reducerPath]: walletApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [loanApi.reducerPath]: loanApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware, 
      profileApi.middleware, 
      kycApi.middleware,
      walletApi.middleware,
      paymentApi.middleware,
      loanApi.middleware,
      adminApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
