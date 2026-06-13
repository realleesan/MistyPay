# MistyPay - API Specification Document

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> API Style: REST API
> Authentication: JWT Bearer Token
> Last Updated: 2026

---

# 1. Document Purpose

This document defines all public APIs required for MistyPay MVP.

Objectives:

- Define API contracts
- Standardize frontend/backend communication
- Support React Native development
- Support NestJS implementation
- Support AI-assisted development

---

# 2. API Standards

## Base URL

Development:

```text
http://localhost:3000/api/v1
```

Staging:

```text
https://staging-api.mistypay.com/api/v1
```

Production:

```text
https://api.mistypay.com/api/v1
```

---

## Authentication

Protected APIs require:

```http
Authorization: Bearer <access_token>
```

---

## Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

---

Error:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PIN",
    "message": "Incorrect PIN."
  }
}
```

---

# 3. Authentication APIs

---

# POST /auth/register

## Purpose

Create user account.

---

## Request

```json
{
  "email": "john@example.com",
  "password": "Password123",
  "country": "United States"
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "userId": "uuid"
  }
}
```

---

# POST /auth/login

## Purpose

Authenticate user.

---

## Request

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "user": {
      "id": "uuid",
      "email": "john@example.com"
    }
  }
}
```

---

# POST /auth/refresh

## Purpose

Refresh access token.

---

## Request

```json
{
  "refreshToken": "jwt"
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt"
  }
}
```

---

# POST /auth/logout

## Purpose

Terminate session.

---

## Request

```json
{}
```

---

## Response

```json
{
  "success": true
}
```

---

# POST /auth/forgot-password

## Request

```json
{
  "email": "john@example.com"
}
```

---

# POST /auth/reset-password

## Request

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "Password123"
}
```

---

# 4. Profile APIs

---

# GET /users/me

## Purpose

Get current user profile.

---

## Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "displayName": "John",
    "country": "United States"
  }
}
```

---

# PATCH /users/me

## Purpose

Update profile.

---

## Request

```json
{
  "displayName": "John Smith",
  "country": "Canada"
}
```

---

# PATCH /profile/pin

## Purpose

Change PIN.

---

## Request

```json
{
  "currentPin": "123456",
  "newPin": "654321"
}
```

---

# PATCH /profile/password

## Purpose

Change password.

---

## Request

```json
{
  "currentPassword": "OldPassword",
  "newPassword": "NewPassword"
}
```

---

# 5. Exchange Rate APIs

---

# GET /rates/current

## Purpose

Get current exchange rate.

---

## Response

```json
{
  "success": true,
  "data": {
    "pair": "USDT/VND",
    "rate": 26000,
    "updatedAt": "2026-01-01T10:00:00Z"
  }
}
```

---

# 6. QR APIs

---

# POST /qr/parse

## Purpose

Parse VietQR.

---

## Request

```json
{
  "qrContent": "000201..."
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "merchantName": "NGUYEN VAN A",
    "bankName": "MB Bank",
    "accountNumber": "123456789"
  }
}
```

---

# 7. Quote APIs

---

# POST /quotes

## Purpose

Generate quote.

---

## Request

```json
{
  "merchantBankCode": "970422",
  "merchantAccountNumber": "123456789",
  "merchantName": "NGUYEN VAN A",
  "amountVnd": 500000
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "quoteId": "uuid",
    "amountVnd": 500000,
    "rate": 26000,
    "serviceFee": 0.15,
    "networkFee": 0.05,
    "totalUsdt": 19.43,
    "expiresAt": "2026-01-01T10:01:00Z"
  }
}
```

---

# GET /quotes/:id

## Purpose

Get quote detail.

---

# 8. Payment APIs

---

# POST /payments

## Purpose

Create payment order.

---

## Request

```json
{
  "quoteId": "uuid",
  "pin": "123456"
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "orderCode": "MP202600001",

    "walletAddress": "TRON_ADDRESS",

    "requiredUsdt": 19.43,

    "expiresAt": "2026-01-01T10:05:00Z",

    "status": "WAITING_USDT"
  }
}
```

---

# GET /payments/:id

## Purpose

Get payment detail.

---

## Response

```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",

    "status": "PAYOUT_PROCESSING",

    "amountVnd": 500000,

    "requiredUsdt": 19.43,

    "merchant": {
      "name": "NGUYEN VAN A",
      "bank": "MB Bank"
    }
  }
}
```

---

# GET /payments/:id/status

## Purpose

Get payment status.

---

## Response

```json
{
  "success": true,
  "data": {
    "status": "SUCCESS"
  }
}
```

---

# 9. Transaction APIs

---

# GET /transactions

## Purpose

Get transaction history.

---

## Query Parameters

```http
?page=1
&limit=20
&status=SUCCESS
```

---

## Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "merchantName": "Coffee Shop",
        "amountVnd": 120000,
        "status": "SUCCESS",
        "createdAt": "2026-01-01"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

---

# GET /transactions/:id

## Purpose

Get transaction detail.

---

## Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",

    "merchantName": "Coffee Shop",

    "amountVnd": 120000,

    "amountUsdt": 4.62,

    "rate": 26000,

    "fee": 0.15,

    "status": "SUCCESS",

    "blockchain": {
      "network": "TRON",
      "txHash": "abcdef123"
    },

    "payout": {
      "status": "PAYOUT_SUCCESS"
    }
  }
}
```

---

# 10. Notification APIs

---

# GET /notifications

## Purpose

Get notifications.

---

## Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Payment Successful",
      "message": "The merchant has received the payment.",
      "isRead": false
    }
  ]
}
```

---

# PATCH /notifications/:id/read

## Purpose

Mark notification as read.

---

# 11. Admin APIs

---

# GET /admin/dashboard

## Purpose

Dashboard metrics.

---

## Response

```json
{
  "success": true,
  "data": {
    "users": 500,
    "transactions": 1200,
    "volume": 250000000,
    "successRate": 98.5
  }
}
```

---

# GET /admin/users

## Purpose

List users.

---

# GET /admin/users/:id

## Purpose

User details.

---

# PATCH /admin/users/:id/suspend

## Purpose

Suspend user.

---

# GET /admin/transactions

## Purpose

List transactions.

---

# GET /admin/transactions/:id

## Purpose

Transaction detail.

---

# GET /admin/rates

## Purpose

Current rate.

---

# PATCH /admin/rates

## Purpose

Override rate.

---

## Request

```json
{
  "rate": 26100
}
```

---

# 12. Internal APIs

These APIs are not exposed to mobile clients.

---

# POST /internal/blockchain/detect

## Purpose

Receive blockchain detection event.

---

## Request

```json
{
  "txHash": "abc123",
  "amount": 19.43
}
```

---

# POST /internal/payout/process

## Purpose

Process payout job.

---

# POST /internal/payout/retry

## Purpose

Retry failed payout.

---

# 13. API Status Values

---

## Payment Status

```text
WAITING_USDT
USDT_DETECTED
USDT_CONFIRMED
UNDERPAID
OVERPAID
EXPIRED
```

---

## Payout Status

```text
PAYOUT_PENDING
PAYOUT_PROCESSING
PAYOUT_SUCCESS
PAYOUT_FAILED
```

---

## Final Status

```text
SUCCESS
FAILED
REFUND_REQUIRED
MANUAL_REVIEW
```

---

# 14. Pagination Standard

Request:

```http
?page=1
&limit=20
```

---

Response:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

# 15. Security Requirements

Protected APIs require:

```text
JWT Access Token
```

---

Sensitive operations require:

```text
PIN Verification
```

Examples:

```text
Create Payment
Change PIN
```

---

# 16. Rate Limiting

Recommended limits:

```text
Login:
10 requests/minute

QR Parse:
60 requests/minute

Quote:
30 requests/minute

Payment Creation:
20 requests/minute
```

---

# 17. MVP API Summary

## Auth

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

---

## Profile

```text
GET /users/me
PATCH /users/me
PATCH /profile/pin
PATCH /profile/password
```

---

## Payments

```text
POST /quotes
POST /payments
GET /payments/:id
GET /payments/:id/status
```

---

## Transactions

```text
GET /transactions
GET /transactions/:id
```

---

## Notifications

```text
GET /notifications
PATCH /notifications/:id/read
```

---

## Admin

```text
GET /admin/dashboard
GET /admin/users
GET /admin/transactions
PATCH /admin/rates
```

---

# 18. Future APIs

Not included in MVP:

```text
Merchant APIs
Referral APIs
Promotion APIs
Cashback APIs
KYC APIs
Multi-chain APIs
Travel Services APIs
```

These APIs will be introduced after MVP validation.
