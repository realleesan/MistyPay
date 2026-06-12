# MistyPay - User Flow Document

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> Product Owner: Le Vu Bao Nhat
> Last Updated: 2026

---

# 1. Document Purpose

This document describes all user interaction flows within MistyPay MVP.

The objective is to:

- Define user journeys
- Standardize application behavior
- Support UI/UX design
- Support backend implementation
- Improve AI-assisted development accuracy

---

# 2. User Roles

## Traveler

Primary user of MistyPay.

Responsibilities:

- Register account
- Login
- Scan VietQR
- Create payment
- View transaction history
- Manage profile

---

## Admin

System administrator.

Responsibilities:

- Monitor system
- Manage transactions
- Manage rates
- Manage users

---

## Operator

Operations staff.

Responsibilities:

- Handle payout failures
- Handle payment disputes
- Monitor settlement process

---

# 3. Application Entry Flow

## Objective

Allow users to access the application securely.

---

## Flow Diagram

```mermaid
flowchart TD

A[Open App]
--> B{Authenticated?}

B -->|No| C[Login Screen]
B -->|Yes| D[Home Screen]

C --> E[Enter Credentials]
E --> F[Authentication Success]

F --> D
```

---

# 4. User Registration Flow

## Objective

Allow new users to create an account.

---

## Flow Diagram

```mermaid
flowchart TD

A[Register]
--> B[Enter Email]

B --> C[Enter Password]

C --> D[Confirm Password]

D --> E[Select Country]

E --> F[Submit Registration]

F --> G{Valid Data?}

G -->|No| H[Display Error]

G -->|Yes| I[Account Created]

I --> J[Login]
```

---

# 5. User Login Flow

## Objective

Allow users to access their accounts.

---

## Flow Diagram

```mermaid
flowchart TD

A[Login Screen]
--> B[Enter Email]

B --> C[Enter Password]

C --> D[Submit]

D --> E{Valid Credentials?}

E -->|No| F[Show Error]

E -->|Yes| G[Generate Session]

G --> H[Home Screen]
```

---

# 6. Forgot Password Flow

## Objective

Allow users to recover access.

---

## Flow Diagram

```mermaid
flowchart TD

A[Forgot Password]
--> B[Enter Email]

B --> C[Send OTP]

C --> D[Verify OTP]

D --> E[Create New Password]

E --> F[Password Updated]
```

---

# 7. Home Screen Flow

## Objective

Provide quick access to core features.

---

## Available Actions

```text
Scan QR
History
Profile
```

---

## Flow Diagram

```mermaid
flowchart TD

A[Home]

A --> B[Scan QR]

A --> C[History]

A --> D[Profile]
```

---

# 8. QR Payment Flow

## Objective

Allow travelers to pay Vietnamese merchants.

---

## High-Level Flow

```mermaid
flowchart TD

A[Scan VietQR]
--> B[Parse QR]

B --> C[Enter VND Amount]

C --> D[Generate Quote]

D --> E[Review Payment]

E --> F[Confirm Payment]

F --> G[Enter PIN]

G --> H[Create Payment Order]

H --> I[Waiting Blockchain Payment]
```

---

# 9. QR Parsing Flow

## Objective

Extract merchant information from QR.

---

## Flow Diagram

```mermaid
flowchart TD

A[Scan QR]
--> B{Valid QR?}

B -->|No| C[Display Error]

B -->|Yes| D[Parse Merchant Information]

D --> E[Merchant Name]

D --> F[Bank Name]

D --> G[Account Number]

E --> H[Quote Screen]

F --> H

G --> H
```

---

# 10. Payment Quote Flow

## Objective

Generate payment amount in USDT.

---

## Flow Diagram

```mermaid
flowchart TD

A[Input VND Amount]
--> B[Get Exchange Rate]

B --> C[Calculate Fee]

C --> D[Calculate Total USDT]

D --> E[Display Quote]

E --> F{Quote Expired?}

F -->|No| G[Continue Payment]

F -->|Yes| H[Refresh Quote]
```

---

# 11. Payment Confirmation Flow

## Objective

Confirm payment intent.

---

## Flow Diagram

```mermaid
flowchart TD

A[Review Payment]
--> B[Confirm]

B --> C[Enter PIN]

C --> D{PIN Valid?}

D -->|No| E[Display Error]

D -->|Yes| F[Create Payment Order]

F --> G[Display Payment Instructions]
```

---

# 12. Blockchain Payment Flow

## Objective

Receive USDT from traveler.

---

## Flow Diagram

```mermaid
flowchart TD

A[Payment Order Created]
--> B[Generate Wallet Address]

B --> C[User Transfers USDT]

C --> D[Blockchain Monitoring]

D --> E{Transaction Detected?}

E -->|No| F[Continue Monitoring]

E -->|Yes| G[Validate Transaction]

G --> H{Valid Amount?}

H -->|No| I[Flag For Review]

H -->|Yes| J[Payment Confirmed]
```

---

# 13. Payout Flow

## Objective

Send VND to merchant.

---

## Flow Diagram

```mermaid
flowchart TD

A[Payment Confirmed]
--> B[Create Payout Request]

B --> C[PayOS / BaoKim]

C --> D{Payout Success?}

D -->|No| E[Payout Failed]

D -->|Yes| F[Merchant Receives VND]

F --> G[Transaction Success]
```

---

# 14. Complete Transaction Flow

## End-To-End User Journey

```mermaid
flowchart TD

A[Open App]
--> B[Login]

B --> C[Scan VietQR]

C --> D[Enter Amount]

D --> E[Generate Quote]

E --> F[Confirm Payment]

F --> G[Enter PIN]

G --> H[Create Order]

H --> I[Transfer USDT]

I --> J[Payment Confirmed]

J --> K[Payout Processing]

K --> L[Merchant Receives VND]

L --> M[Success]
```

---

# 15. Transaction History Flow

## Objective

Allow users to view past payments.

---

## Flow Diagram

```mermaid
flowchart TD

A[History Screen]
--> B[Transaction List]

B --> C[Select Transaction]

C --> D[Transaction Detail]
```

---

# 16. Transaction Detail Flow

## Objective

Display complete transaction information.

---

## Information Displayed

```text
Transaction ID
Merchant Name
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

## Flow Diagram

```mermaid
flowchart TD

A[Transaction Detail]

A --> B[Basic Information]

A --> C[Status Information]

A --> D[Payment Information]
```

---

# 17. Profile Flow

## Objective

Allow users to manage account settings.

---

## Flow Diagram

```mermaid
flowchart TD

A[Profile]

A --> B[Personal Information]

A --> C[Security Settings]

A --> D[Logout]
```

---

# 18. Security Flow

## Change Password

```mermaid
flowchart TD

A[Current Password]
--> B[New Password]

B --> C[Confirm Password]

C --> D[Password Updated]
```

---

## Change PIN

```mermaid
flowchart TD

A[Current PIN]
--> B[New PIN]

B --> C[Confirm PIN]

C --> D[PIN Updated]
```

---

# 19. Error Handling Flows

## Invalid QR

```mermaid
flowchart TD

A[Scan QR]
--> B[Invalid QR]

B --> C[Display Error]

C --> D[Retry Scan]
```

---

## Payment Timeout

```mermaid
flowchart TD

A[Waiting Payment]
--> B[Timeout]

B --> C[Order Expired]

C --> D[Return Home]
```

---

## Payout Failure

```mermaid
flowchart TD

A[Payout Processing]
--> B[Payout Failed]

B --> C[Operator Review]

C --> D[Retry Payout]
```

---

# 20. MVP User Flows Summary

## Traveler Flows

```text
Register
Login
Forgot Password
Scan QR
Create Payment
View History
Manage Profile
```

---

## Admin Flows

```text
Manage Users
Manage Transactions
Manage Rates
View Dashboard
```

---

## Operator Flows

```text
Review Failed Payments
Review Failed Payouts
Retry Payout
Reconciliation
```

---

# 21. Future Flows (Post-MVP)

Not included in MVP:

```text
Referral Program
Merchant Portal
Cashback
Loyalty Program
Travel Marketplace
eSIM Purchase
Hotel Booking
Multi-Country Payments
```

These flows will be defined in future versions after MVP validation.
