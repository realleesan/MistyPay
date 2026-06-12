# MistyPay - Product Requirements Document (PRD)

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> Product Owner: Le Vu Bao Nhat
> Last Updated: 2026

---

# 1. Document Purpose

This document defines the functional and non-functional requirements for MistyPay MVP.

The goal is to provide a detailed specification for:

- Product Design
- UI/UX Design
- Backend Development
- Database Design
- AI-assisted Development (Vibe Coding)

---

# 2. Product Scope

## MVP Goal

Allow international travelers to:

```text
Scan VietQR
↓
Enter VND Amount
↓
Pay with USDT
↓
Merchant receives VND
```

within a simple and intuitive workflow.

---

# 3. User Roles

## 3.1 Traveler

Primary user of the application.

Capabilities:

- Register account
- Login
- Scan VietQR
- Create payment
- View payment history
- Manage profile

---

## 3.2 Admin

System administrator.

Capabilities:

- Manage users
- Manage exchange rates
- Manage transactions
- Monitor payouts

---

## 3.3 Operator

Operations staff.

Capabilities:

- Handle payout failures
- Reconcile transactions
- Resolve payment issues

---

# 4. User Journey

## Main Payment Journey

```text
Open App
↓
Login
↓
Scan VietQR
↓
Input VND Amount
↓
Receive USDT Quote
↓
Confirm Payment
↓
USDT Transfer
↓
Payout Processing
↓
Success
```

---

# 5. Functional Requirements

---

# FR-01 Authentication

## Description

Users must authenticate before using the application.

---

## Features

### Register

Required fields:

```text
Email
Password
Confirm Password
Country
```

Validation:

```text
Email must be unique
Password >= 8 characters
```

---

### Login

Required fields:

```text
Email
Password
```

---

### Forgot Password

Flow:

```text
Email
↓
OTP
↓
Reset Password
```

---

### Logout

User can logout from current device.

---

# FR-02 Security PIN

## Description

A transaction PIN is required before payment.

---

## Features

### Setup PIN

Required:

```text
6 digits
```

---

### Verify PIN

Before payment:

```text
Enter PIN
```

---

### Change PIN

Required:

```text
Old PIN
New PIN
```

---

# FR-03 Home Screen

## Description

Main dashboard after login.

---

## Components

### Welcome Section

Display:

```text
User Name
```

---

### Quick Actions

Buttons:

```text
Scan QR
History
Profile
```

---

### Exchange Rate Widget

Display:

```text
Current USDT/VND Rate
Last Updated
```

---

# FR-04 QR Scanner

## Description

Allow users to scan VietQR codes.

---

## Features

### Camera Scanner

Supported:

```text
VietQR
EMV QR
```

---

### QR Parsing

Extract:

```text
Bank Name
Bank Account
Account Holder
```

---

## Error Cases

### Invalid QR

Display:

```text
Invalid QR Code
```

---

### Unsupported QR

Display:

```text
Unsupported QR Format
```

---

# FR-05 Payment Quote

## Description

Generate payment quote.

---

## Input

```text
VND Amount
```

---

## Output

Display:

```text
Merchant Name
Bank
Amount VND
Exchange Rate
Service Fee
Network Fee
Total USDT
```

---

## Example

```text
500,000 VND

Rate:
1 USDT = 26,000

Fee:
0.20 USDT

Total:
19.43 USDT
```

---

## Quote Expiration

Quote valid for:

```text
60 seconds
```

---

# FR-06 Payment Creation

## Description

Create a payment order.

---

## Process

```text
Generate Order
↓
Generate Payment Address
↓
Wait for Blockchain Transfer
```

---

## Order Status

Possible values:

```text
CREATED
WAITING_PAYMENT
EXPIRED
```

---

# FR-07 Blockchain Monitoring

## Description

Monitor blockchain transactions.

---

## Features

Detect:

```text
Transaction Hash
Amount
Wallet Address
Timestamp
```

---

## Validation

Verify:

```text
Correct Wallet
Correct Amount
Correct Order
```

---

## Status

```text
PAYMENT_DETECTED
PAYMENT_CONFIRMED
```

---

# FR-08 Payout Processing

## Description

Send VND to merchant.

---

## Process

```text
Payment Confirmed
↓
Create Payout Request
↓
PayOS/BaoKim
↓
Merchant Receives VND
```

---

## Status

```text
PAYOUT_PENDING
PAYOUT_PROCESSING
PAYOUT_SUCCESS
PAYOUT_FAILED
```

---

# FR-09 Transaction History

## Description

Display user transaction history.

---

## List Information

Display:

```text
Date
Amount
Status
Merchant
```

---

## Transaction Detail

Display:

```text
Transaction ID
Merchant
Bank
VND Amount
USDT Amount
Rate
Fee
Status
Created Time
Completed Time
```

---

# FR-10 User Profile

## Description

Manage user information.

---

## Features

### View Profile

Display:

```text
Name
Email
Country
```

---

### Edit Profile

Editable:

```text
Display Name
Country
```

---

### Security Settings

Manage:

```text
Password
PIN
```

---

# FR-11 Notifications

## Description

Notify users about transaction updates.

---

## Events

```text
Payment Created
Payment Received
Payout Completed
Transaction Failed
```

---

# FR-12 Exchange Rate Service

## Description

Provide USDT/VND conversion rates.

---

## Data Source

MVP:

```text
Binance API
```

---

## Update Frequency

```text
Every 30 seconds
```

---

# FR-13 Admin Dashboard

## Description

System management portal.

---

## Dashboard Metrics

Display:

```text
Total Users
Total Transactions
Total Volume
Success Rate
```

---

## User Management

Actions:

```text
Search User
View User
Suspend User
```

---

## Transaction Management

Actions:

```text
Search Transaction
View Details
Retry Payout
```

---

## Rate Management

Actions:

```text
View Current Rate
Override Rate
```

---

# 6. State Machine

## Transaction Lifecycle

```text
CREATED
↓
WAITING_PAYMENT
↓
PAYMENT_DETECTED
↓
PAYMENT_CONFIRMED
↓
PAYOUT_PENDING
↓
PAYOUT_PROCESSING
↓
SUCCESS
```

---

## Failure States

```text
EXPIRED
FAILED
PAYOUT_FAILED
```

---

# 7. Non Functional Requirements

## Performance

### Payment Flow

Target:

```text
< 10 seconds
```

---

### API Response

Target:

```text
< 500ms
```

---

## Availability

Target:

```text
99.5%
```

---

## Security

Requirements:

```text
JWT Authentication
Encrypted PIN
HTTPS Only
Rate Limiting
```

---

## Scalability

System should support:

```text
10,000 users
```

without architecture changes.

---

# 8. MVP Exclusions

The following features are NOT included:

```text
KYC
Merchant Portal
Referral Program
Cashback
Loyalty Program
NFT
Staking
Swap
Multi-Chain Support
Travel Booking
eSIM Marketplace
```

---

# 9. Success Criteria

## Technical

```text
API Success Rate > 99%
Payout Success Rate > 95%
Crash Rate < 1%
```

---

## Product

```text
50 Beta Users
100 Successful Transactions
Average Payment Time < 10 Seconds
```

---

# 10. Future Versions

## V1.1

```text
Referral Program
Welcome Bonus
Promotions
```

---

## V1.2

```text
Merchant Portal
Merchant Analytics
Merchant Dashboard
```

---

## V2.0

```text
Multi Country Support
Thailand
Indonesia
Philippines
Malaysia
```

---

## V3.0

```text
Travel Fintech Ecosystem
```
