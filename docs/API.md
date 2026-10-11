# FlowFi API Documentation

This file will contain the API definitions for the FlowFi backend.

## Auth Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

## Wallet Endpoints
- `GET /api/wallet/balance` - Get user wallet balance
- `POST /api/wallet/add` - Add money (via Razorpay)
- `POST /api/wallet/transfer` - Send money to another user
