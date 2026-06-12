# MistyPay - Product Overview Document (POD)

> Version: 1.0
> Status: Draft - Pre MVP
> Product Owner: Le Vu Bao Nhat
> Brand: Misty Team 

---

# 1. Product Overview

## 1.1 Product Name

**MistyPay**

## 1.2 Slogan

> Pay Like A Local

## 1.3 Product Vision

MistyPay is a travel payment platform that enables international travelers to pay Vietnamese merchants using USDT while merchants continue receiving Vietnamese Dong (VND) directly into their bank accounts.

The product aims to bridge the gap between:

- Stablecoin holders
- VietQR ecosystem
- Local merchants

Without requiring:

- Vietnamese bank accounts
- Cash exchange
- International card payments

---

# 2. Problem Statement

## 2.1 Current Situation

International travelers visiting Vietnam often face several challenges:

### Cash Payments

- Need to exchange foreign currency
- Exchange rate risks
- Carrying cash is inconvenient

### International Cards

- Many small merchants do not support cards
- Additional transaction fees
- Limited acceptance compared to VietQR

### VietQR Ecosystem

Vietnam has rapidly adopted QR payments.

However:

- Foreign visitors cannot directly use VietQR
- Most QR payments require local banking infrastructure

---

## 2.2 Market Opportunity

Vietnam has:

- Wide VietQR adoption
- Increasing tourism
- Growing stablecoin adoption

Currently there is no mainstream solution allowing:

```text
USDT
↓
VietQR
↓
Merchant receives VND
```

with a seamless user experience.

---

# 3. Proposed Solution

## MistyPay

MistyPay allows travelers to:

```text
Scan VietQR
↓
Enter VND amount
↓
Pay with USDT
↓
Merchant receives VND
```

within a few seconds.

---

# 4. Core Value Proposition

## For Travelers

No need for:

- Vietnamese bank account
- Cash exchange
- International cards

Only need:

- Smartphone
- USDT balance
- MistyPay application

---

## For Merchants

No need for:

- Crypto wallets
- New merchant applications
- Additional registration

Only need:

- Existing VietQR code

---

# 5. Target Users

## Primary Users

### International Travelers

Characteristics:

- Age: 18-50
- Visiting Vietnam
- Own USDT
- Frequently use smartphones

Examples:

- American tourists
- European tourists
- Digital nomads
- International freelancers

---

## Secondary Users

### Expats

Foreigners living and working in Vietnam.

---

# 6. Business Flow

## Standard Transaction Flow

### Step 1

Merchant provides:

```text
Price: 500,000 VND
```

and a VietQR code.

---

### Step 2

Traveler opens MistyPay.

---

### Step 3

Traveler scans VietQR.

---

### Step 4

Traveler enters:

```text
500,000 VND
```

---

### Step 5

System displays:

```text
Exchange Rate
Network Fee
Service Fee
Required USDT
```

Example:

```text
Amount: 500,000 VND

Rate:
1 USDT = 26,000 VND

Fee:
0.20 USDT

Total:
19.43 USDT
```

---

### Step 6

Traveler confirms payment.

Authentication methods:

- App PIN
- OTP

---

### Step 7

USDT is transferred to MistyPay settlement wallet.

---

### Step 8

MistyPay initiates payout.

---

### Step 9

Merchant receives VND.

---

### Step 10

Transaction completed.

---

# 7. User Roles

## Traveler

Responsibilities:

- Register account
- Login
- Scan QR
- Create payment
- View transaction history

---

## Admin

Responsibilities:

- Manage system
- Manage exchange rates
- Manage transactions
- Manage users

---

## Operator

Responsibilities:

- Monitor payouts
- Resolve failed transactions
- Handle reconciliation

---

# 8. Financial Architecture

## Incoming Asset

```text
USDT
```

---

## Liquidity Pool

```text
BaoKim Wallet
```

Used to maintain VND liquidity.

---

## Outgoing Asset

```text
VND
```

Paid to merchant bank accounts.

---

## Settlement Model

```text
Traveler
↓
USDT

MistyPay
↓
VND

Merchant
```

---

# 9. Technical Architecture

## Mobile Application

```text
React Native
Expo
TypeScript
```

---

## Backend

```text
NestJS
TypeScript
```

---

## Database

```text
PostgreSQL
```

---

## Queue Processing

```text
Redis
BullMQ
```

---

## Blockchain

```text
USDT TRC20
TronGrid
```

---

## Payment Infrastructure

```text
PayOS
BaoKim
```

---

## Infrastructure

```text
Ubuntu VPS
Nginx
PM2
```

---

# 10. Product Philosophy

## What MistyPay Sells

MistyPay does NOT sell:

- Blockchain
- Crypto
- Stablecoins

MistyPay sells:

```text
Convenience
Fast Payments
Travel Experience
```

---

## UX Principle

Simple flow:

```text
Scan
↓
Pay
↓
Done
```

---

## Avoid Technical Exposure

Avoid exposing:

- Blockchain hashes
- Gas fees
- Technical terminology

unless necessary.

---

# 11. MVP Scope

## Authentication

Features:

- Register
- Login
- OTP Verification
- PIN Authentication

---

## QR Payment

Features:

- Scan VietQR
- Parse VietQR
- Quote Calculation
- Payment Confirmation

---

## Transaction Management

Features:

- Transaction History
- Transaction Detail
- Status Tracking

---

## Profile

Features:

- User Information
- Security Settings
- Preferences

---

# 12. MVP Success Metrics

## Technical KPIs

```text
API Success Rate > 99%
Crash Rate < 1%
Payout Success Rate > 95%
```

---

## Product KPIs

```text
50 Test Users
100 Successful Transactions
Average Payment Time < 10 Seconds
```

---

# 13. Development Roadmap

## Phase 1

### Product Design

Deliverables:

- Product Requirements
- User Flows
- Wireframes
- Database Design
- Architecture Design

---

## Phase 2

### UI Prototype

Deliverables:

- React Native Application
- Mock Data Flow
- Clickable Prototype

---

## Phase 3

### Backend Foundation

Deliverables:

- Authentication Module
- User Module
- Transaction Module
- Rate Module

---

## Phase 4

### Payout Integration

Deliverables:

- PayOS Integration
- BaoKim Integration
- Payout Workflow

---

## Phase 5

### Blockchain Integration

Deliverables:

- USDT TRC20 Integration
- Wallet Monitoring
- Blockchain Verification

---

## Phase 6

### Internal Testing

Deliverables:

- Functional Testing
- Payout Testing
- Transaction Testing

---

## Phase 7

### TestFlight Beta

Deliverables:

- Public Beta
- User Feedback Collection
- UX Improvements

---

# 14. Long-Term Vision

Transform MistyPay into:

```text
Stablecoin Payment Platform
+
Local QR Payment Network
+
Travel Fintech Ecosystem
```

for Southeast Asia.

Potential Expansion:

- Vietnam
- Thailand
- Indonesia
- Philippines
- Malaysia

---

# 15. Out of Scope (MVP)

The following features are intentionally excluded from MVP:

- NFT
- Staking
- Multi-chain support
- Crypto exchange
- Merchant portal
- Loyalty program
- Cashback program
- Referral system
- Travel booking
- eSIM marketplace

These features may be considered in future versions after product validation.
