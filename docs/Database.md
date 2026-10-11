# FlowFi Database Schema

This document will outline the database schema for the FlowFi platform.

## Entities
- `User` - Authentication and role details.
- `Profile` - User profile information, linked to `User`.
- `Wallet` - User's wallet balance, linked to `User`.
- `Transaction` - Ledger of all wallet activities.
- `Payment` - External payments (e.g., Razorpay top-ups).
- `Loan` / `LoanApplication` / `LoanDocument` - Loan marketplace entities.
- `KYC` - Document verification status.
