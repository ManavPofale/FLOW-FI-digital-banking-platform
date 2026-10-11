# FlowFi - Next Generation Digital Banking Platform

## Overview
A complete digital banking ecosystem with payments, lending, AI, and live verification.

## Features
- Authentication & Security (JWT, RBAC)
- Digital Wallet & QR Payments
- Transaction Dashboard & Analytics
- Loan Marketplace & Live Verification (WebRTC)
- AI Finance Assistant
- Real-Time Communication (Socket.io)

## Setup Instructions

### Prerequisites
- Docker (for Postgres and Redis)
- Node.js (v18+)

### Running Services
```bash
docker-compose up -d
```

### Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
