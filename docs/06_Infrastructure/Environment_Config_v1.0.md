# MistyPay - Environment Config Document

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> Infrastructure: VPS Ubuntu + Docker Compose
> Last Updated: 2026

---

# 1. Document Purpose

This document defines all environment variables required for MistyPay MVP.

Objectives:

- Standardize environment configuration
- Separate local, staging and production environments
- Protect sensitive credentials
- Support backend deployment
- Support worker deployment
- Support AI-assisted development

---

# 2. Environment Types

MistyPay uses three environments:

```text
local
staging
production
```

---

## Local

Purpose:

```text
Development
Testing with mock services
```

---

## Staging

Purpose:

```text
Internal testing
TestFlight testing
Sandbox provider testing
```

---

## Production

Purpose:

```text
Real users
Real transactions
Real payouts
```

---

# 3. Environment Files

Recommended files:

```text
.env.example
.env.local
.env.staging
.env.production
```

---

## Rule

Never commit:

```text
.env.local
.env.staging
.env.production
```

Only commit:

```text
.env.example
```

---

# 4. Core App Config

```env
APP_NAME=MistyPay
APP_ENV=local
APP_PORT=3000
APP_URL=http://localhost:3000
API_PREFIX=/api/v1
```

---

## APP_ENV Values

```text
local
staging
production
```

---

# 5. Database Config

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mistypay
```

---

## Local Example

```env
DATABASE_URL=postgresql://mistypay:password@localhost:5432/mistypay_local
```

---

## Staging Example

```env
DATABASE_URL=postgresql://mistypay:password@postgres:5432/mistypay_staging
```

---

## Production Example

```env
DATABASE_URL=postgresql://mistypay:secure_password@postgres:5432/mistypay_production
```

---

# 6. Redis Config

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## Docker Example

```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=strong_password
REDIS_DB=0
```

---

# 7. JWT Config

```env
JWT_ACCESS_SECRET=replace_with_secure_secret
JWT_REFRESH_SECRET=replace_with_secure_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

---

## Rule

Secrets must be:

```text
Long
Random
Different between environments
```

---

# 8. Password & PIN Config

```env
BCRYPT_SALT_ROUNDS=12
PIN_HASH_SALT_ROUNDS=12
PIN_MAX_ATTEMPTS=5
PIN_LOCK_DURATION_MINUTES=15
```

---

# 9. Rate Provider Config

```env
RATE_PROVIDER=BINANCE
BINANCE_API_URL=https://api.binance.com
RATE_PAIR=USDT_VND
RATE_CACHE_TTL_SECONDS=30
QUOTE_EXPIRES_SECONDS=60
```

---

# 10. Blockchain Config

```env
BLOCKCHAIN_NETWORK=TRON
SUPPORTED_TOKEN=USDT
TRON_GRID_API_URL=https://api.trongrid.io
TRON_GRID_API_KEY=replace_with_trongrid_key
TRON_SETTLEMENT_WALLET=TXXXXXXXXXXXXXXXXXXXXXXXX
TRON_CONFIRMATION_REQUIRED=1
BLOCKCHAIN_POLL_INTERVAL_SECONDS=2
USDT_AMOUNT_TOLERANCE=0.01
```

---

# 11. Payout Provider Config

```env
PAYOUT_PROVIDER=BAOKIM
PAYOUT_CURRENCY=VND
PAYOUT_MAX_RETRY=3
PAYOUT_RETRY_DELAY_SECONDS=60
```

---

# 12. BaoKim Config

```env
BAOKIM_API_URL=https://api.baokim.vn
BAOKIM_CLIENT_ID=replace_with_client_id
BAOKIM_CLIENT_SECRET=replace_with_client_secret
BAOKIM_API_KEY=replace_with_api_key
BAOKIM_WEBHOOK_SECRET=replace_with_webhook_secret
BAOKIM_WALLET_ID=replace_with_wallet_id
```

---

# 13. PayOS Config

```env
PAYOS_API_URL=https://api.payos.vn
PAYOS_CLIENT_ID=replace_with_client_id
PAYOS_API_KEY=replace_with_api_key
PAYOS_CHECKSUM_KEY=replace_with_checksum_key
PAYOS_WEBHOOK_SECRET=replace_with_webhook_secret
```

---

# 14. Treasury Config

```env
VND_LOW_BALANCE_THRESHOLD=5000000
VND_CRITICAL_BALANCE_THRESHOLD=1000000
USDT_LOW_BALANCE_THRESHOLD=100
TREASURY_ALERT_ENABLED=true
```

---

# 15. Queue Config

```env
QUEUE_PREFIX=mistypay
QUEUE_CONCURRENCY_BLOCKCHAIN=5
QUEUE_CONCURRENCY_PAYOUT=3
QUEUE_CONCURRENCY_NOTIFICATION=5
QUEUE_CONCURRENCY_RECONCILIATION=1
```

---

# 16. Notification Config

```env
NOTIFICATION_ENABLED=true
EMAIL_PROVIDER=none
PUSH_NOTIFICATION_PROVIDER=none
```

---

## Future Email Config

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

---

# 17. Admin Config

```env
ADMIN_DEFAULT_EMAIL=admin@mistypay.vn
ADMIN_DEFAULT_PASSWORD=change_me
ADMIN_SESSION_EXPIRES_IN=1d
```

---

## Rule

Default admin password must be changed immediately after first login.

---

# 18. CORS Config

```env
CORS_ORIGIN=http://localhost:19006,https://app.mistypay.vn
```

---

## Production Rule

Do not use:

```env
CORS_ORIGIN=*
```

in production.

---

# 19. Rate Limiting Config

```env
RATE_LIMIT_TTL_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=100

LOGIN_RATE_LIMIT_MAX=10
QUOTE_RATE_LIMIT_MAX=30
PAYMENT_RATE_LIMIT_MAX=20
```

---

# 20. Logging Config

```env
LOG_LEVEL=debug
LOG_FORMAT=json
LOG_RETENTION_DAYS=30
```

---

## Production

```env
LOG_LEVEL=info
```

---

# 21. Reconciliation Config

```env
RECONCILIATION_ENABLED=true
RECONCILIATION_RUN_TIME=00:30
RECONCILIATION_TIMEZONE=Asia/Ho_Chi_Minh
```

---

# 22. Feature Flags

```env
FEATURE_REAL_PAYOUT=false
FEATURE_REAL_BLOCKCHAIN=false
FEATURE_ADMIN_PANEL=true
FEATURE_NOTIFICATIONS=false
FEATURE_MANUAL_REVIEW=true
```

---

## MVP Usage

During early development:

```env
FEATURE_REAL_PAYOUT=false
FEATURE_REAL_BLOCKCHAIN=false
```

During staging:

```env
FEATURE_REAL_PAYOUT=true
FEATURE_REAL_BLOCKCHAIN=true
```

---

# 23. Mobile App Config

## Expo Public Variables

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_APP_ENV=local
EXPO_PUBLIC_APP_NAME=MistyPay
```

---

## Rule

Only expose non-sensitive values using:

```text
EXPO_PUBLIC_
```

Never expose:

```text
API keys
Secrets
Wallet private keys
Provider credentials
```

---

# 24. Secret Management Rules

## Must Never Commit

```text
Private keys
API keys
JWT secrets
Provider secrets
Database passwords
BaoKim credentials
PayOS credentials
```

---

## Recommended Storage

Local:

```text
.env.local
```

Staging / Production:

```text
Server environment variables
Docker secrets
Encrypted secret manager
```

---

# 25. Environment Validation

Backend must validate required env variables on startup.

Required variables:

```text
DATABASE_URL
REDIS_HOST
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
TRON_GRID_API_KEY
TRON_SETTLEMENT_WALLET
```

---

# 26. .env.example

```env
APP_NAME=MistyPay
APP_ENV=local
APP_PORT=3000
APP_URL=http://localhost:3000
API_PREFIX=/api/v1

DATABASE_URL=postgresql://mistypay:password@localhost:5432/mistypay_local

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUNDS=12
PIN_HASH_SALT_ROUNDS=12
PIN_MAX_ATTEMPTS=5
PIN_LOCK_DURATION_MINUTES=15

RATE_PROVIDER=BINANCE
BINANCE_API_URL=https://api.binance.com
RATE_PAIR=USDT_VND
RATE_CACHE_TTL_SECONDS=30
QUOTE_EXPIRES_SECONDS=60

BLOCKCHAIN_NETWORK=TRON
SUPPORTED_TOKEN=USDT
TRON_GRID_API_URL=https://api.trongrid.io
TRON_GRID_API_KEY=change_me
TRON_SETTLEMENT_WALLET=change_me
TRON_CONFIRMATION_REQUIRED=1
BLOCKCHAIN_POLL_INTERVAL_SECONDS=2
USDT_AMOUNT_TOLERANCE=0.01

PAYOUT_PROVIDER=BAOKIM
PAYOUT_CURRENCY=VND
PAYOUT_MAX_RETRY=3
PAYOUT_RETRY_DELAY_SECONDS=60

BAOKIM_API_URL=https://api.baokim.vn
BAOKIM_CLIENT_ID=change_me
BAOKIM_CLIENT_SECRET=change_me
BAOKIM_API_KEY=change_me
BAOKIM_WEBHOOK_SECRET=change_me
BAOKIM_WALLET_ID=change_me

PAYOS_API_URL=https://api.payos.vn
PAYOS_CLIENT_ID=change_me
PAYOS_API_KEY=change_me
PAYOS_CHECKSUM_KEY=change_me
PAYOS_WEBHOOK_SECRET=change_me

VND_LOW_BALANCE_THRESHOLD=5000000
VND_CRITICAL_BALANCE_THRESHOLD=1000000
USDT_LOW_BALANCE_THRESHOLD=100
TREASURY_ALERT_ENABLED=true

QUEUE_PREFIX=mistypay
QUEUE_CONCURRENCY_BLOCKCHAIN=5
QUEUE_CONCURRENCY_PAYOUT=3
QUEUE_CONCURRENCY_NOTIFICATION=5
QUEUE_CONCURRENCY_RECONCILIATION=1

CORS_ORIGIN=http://localhost:19006

RATE_LIMIT_TTL_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=10
QUOTE_RATE_LIMIT_MAX=30
PAYMENT_RATE_LIMIT_MAX=20

LOG_LEVEL=debug
LOG_FORMAT=json
LOG_RETENTION_DAYS=30

RECONCILIATION_ENABLED=true
RECONCILIATION_RUN_TIME=00:30
RECONCILIATION_TIMEZONE=Asia/Ho_Chi_Minh

FEATURE_REAL_PAYOUT=false
FEATURE_REAL_BLOCKCHAIN=false
FEATURE_ADMIN_PANEL=true
FEATURE_NOTIFICATIONS=false
FEATURE_MANUAL_REVIEW=true
```

---

# 27. Environment Summary

## Most Critical Variables

```text
DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
TRON_GRID_API_KEY
TRON_SETTLEMENT_WALLET
BAOKIM_API_KEY
PAYOS_API_KEY
```

---

## Highest Security Rule

```text
Never expose secrets to the mobile app.
```

---

# 28. Final Notes

Environment configuration must be reviewed before each deployment.

Before enabling real transactions:

```text
FEATURE_REAL_BLOCKCHAIN=true
FEATURE_REAL_PAYOUT=true
```

must only be enabled after:

```text
Staging test passed
Treasury balance verified
Payout provider verified
Monitoring enabled
```
