# MistyPay - Wireframe Notes Document

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> Product Owner: Le Vu Bao Nhat
> Last Updated: 2026

---

# 1. Document Purpose

This document defines the wireframe structure of all MVP screens.

Objectives:

- Define screen layout
- Define UI components
- Define user actions
- Define API dependencies
- Support React Native implementation
- Support AI-assisted development

---

# 2. Global Layout Rules

## Safe Area

All screens must use:

```text
SafeAreaView
```

---

## Screen Structure

```text
Header
↓
Content
↓
Bottom Action Area (Optional)
```

---

## Default Padding

```text
16px
```

---

## Component Gap

```text
12px
```

---

## Section Gap

```text
24px
```

---

# S001 - Splash Screen

## Purpose

Application initialization.

---

## Layout

```text
+------------------+
|                  |
|                  |
|      Logo        |
|                  |
|   Loading Icon   |
|                  |
|                  |
+------------------+
```

---

## Components

### App Logo

Type:

```text
Image
```

---

### Loading Indicator

Type:

```text
ActivityIndicator
```

---

## API Calls

None

---

# S002 - Login Screen

## Purpose

Authenticate user.

---

## Layout

```text
+----------------------+

      MistyPay

 Email

 Password

 [ Login ]

 Forgot Password

 Create Account

+----------------------+
```

---

## Components

### Logo

```text
Image
```

---

### Email Input

```text
TextInput
```

Validation:

```text
Email Format
Required
```

---

### Password Input

```text
Secure TextInput
```

Validation:

```text
Required
```

---

### Login Button

```text
Primary Button
```

---

### Forgot Password Link

```text
Text Button
```

---

### Register Link

```text
Text Button
```

---

## API Calls

```http
POST /auth/login
```

---

# S003 - Register Screen

## Purpose

Create account.

---

## Layout

```text
Email

Password

Confirm Password

Country

[ Register ]
```

---

## Components

### Country Selector

Type:

```text
Dropdown
```

---

### Register Button

Type:

```text
Primary Button
```

---

## API Calls

```http
POST /auth/register
```

---

# S101 - Home Screen

## Purpose

Main dashboard.

---

## Layout

```text
+--------------------------------+

Hello, James

+------------------------------+
| Current Rate                 |
| 1 USDT = 26,000 VND         |
+------------------------------+

[ Scan QR ]

Recent Transactions

+------------------------------+
| Coffee Shop                  |
| 120,000 VND                  |
+------------------------------+

+--------------------------------+
```

---

## Components

### Header

Display:

```text
Welcome Message
Display Name
```

---

### Rate Card

Display:

```text
Current Rate
Updated Time
```

---

### Primary Scan Button

Type:

```text
Primary CTA
```

Importance:

```text
Highest Priority
```

---

### Recent Transactions

Display:

```text
Last 5 Transactions
```

---

## API Calls

```http
GET /rates/current

GET /transactions/recent
```

---

# S102 - Scan QR Screen

## Purpose

Scan merchant QR.

---

## Layout

```text
+--------------------+

 Camera View

 ┌────────────┐
 │            │
 │   QR BOX   │
 │            │
 └────────────┘

 Flash

+--------------------+
```

---

## Components

### Camera

Type:

```text
Expo Camera
```

---

### QR Frame Overlay

Type:

```text
Custom Overlay
```

---

### Flash Toggle

Type:

```text
Icon Button
```

---

## API Calls

None

QR processed locally.

---

# S103 - Payment Quote Screen

## Purpose

Display quote.

---

## Layout

```text
Merchant

Bank

Account

----------------

Amount (VND)

[ Input ]

----------------

Rate

Fee

Total USDT

----------------

[ Continue ]
```

---

## Components

### Merchant Card

Display:

```text
Merchant Name
Bank
Account
```

---

### Amount Input

Type:

```text
Numeric Input
```

---

### Quote Summary

Display:

```text
Rate
Fee
Required USDT
```

---

### Quote Countdown

Display:

```text
60s Remaining
```

---

### Continue Button

Type:

```text
Primary Button
```

---

## API Calls

```http
POST /quotes
```

---

# S104 - Payment Confirmation Screen

## Purpose

Review payment.

---

## Layout

```text
Merchant

Amount

Rate

Fee

Total

----------------

PIN

[ Confirm Payment ]
```

---

## Components

### Payment Summary Card

Display:

```text
Merchant
Bank
Amount
Fee
Total
```

---

### PIN Input

Type:

```text
6-digit PIN
```

---

### Confirm Button

Type:

```text
Primary Button
```

---

## API Calls

```http
POST /payments
```

---

# S105 - Payment Processing Screen

## Purpose

Display transaction progress.

---

## Layout

```text
Processing Payment

● Waiting Payment

● Payment Detected

● Payment Confirmed

● Sending Money

```

---

## Components

### Progress Indicator

Type:

```text
Vertical Stepper
```

---

### Status Message

Display:

```text
Current Transaction State
```

---

## API Calls

```http
GET /payments/:id
```

Polling:

```text
Every 2 Seconds
```

---

# S106 - Payment Success Screen

## Purpose

Show successful payment.

---

## Layout

```text
✓

Payment Successful

500,000 VND

Merchant Name

Transaction ID

[ View Details ]

[ Back Home ]
```

---

## Components

### Success Icon

Type:

```text
Animated Icon
```

---

### Amount Display

Style:

```text
Large Number
```

---

### Action Buttons

```text
View Details
Back Home
```

---

## API Calls

```http
GET /payments/:id
```

---

# S107 - Payment Failed Screen

## Purpose

Display failure state.

---

## Layout

```text
X

Payment Failed

Reason

[ Try Again ]

[ Back Home ]
```

---

## Components

### Error Icon

### Error Message

### Action Buttons

---

## API Calls

None

---

# S201 - Transaction History Screen

## Purpose

Display transaction history.

---

## Layout

```text
Search

Filter

----------------

Transaction

Transaction

Transaction

Transaction
```

---

## Components

### Search Input

### Filter Dropdown

Options:

```text
Success
Pending
Failed
```

---

### Transaction Card

Display:

```text
Merchant
Amount
Status
Date
```

---

## API Calls

```http
GET /transactions
```

---

# S202 - Transaction Detail Screen

## Purpose

Display transaction information.

---

## Layout

```text
Transaction ID

Status

----------------

Merchant

Amount

Rate

Fee

----------------

Blockchain

Hash

----------------

Payout Status
```

---

## Components

### Basic Information Card

### Payment Information Card

### Blockchain Information Card

### Payout Information Card

---

## API Calls

```http
GET /payments/:id
```

---

# S301 - Profile Screen

## Purpose

Display user profile.

---

## Layout

```text
Avatar

Name

Email

Country

----------------

Edit Profile

Security

Logout
```

---

## Components

### User Card

Display:

```text
Avatar
Name
Email
```

---

### Menu List

```text
Edit Profile
Security
Logout
```

---

## API Calls

```http
GET /users/me
```

---

# S302 - Edit Profile Screen

## Purpose

Edit user information.

---

## Components

### Display Name

### Country

### Save Button

---

## API Calls

```http
PATCH /users/me
```

---

# S303 - Security Settings Screen

## Purpose

Manage security.

---

## Components

```text
Change PIN
Change Password
```

---

## API Calls

None

---

# S304 - Change PIN Screen

## Components

```text
Current PIN

New PIN

Confirm PIN

Save
```

---

## API Calls

```http
PATCH /profile/pin
```

---

# S305 - Change Password Screen

## Components

```text
Current Password

New Password

Confirm Password

Save
```

---

## API Calls

```http
PATCH /profile/password
```

---

# 3. Shared Components

## App Header

Used In:

```text
Home
History
Profile
```

---

## Rate Card

Used In:

```text
Home
Quote
```

---

## Transaction Card

Used In:

```text
History
Home
```

---

## Payment Summary Card

Used In:

```text
Quote
Confirmation
Success
```

---

# 4. MVP Component Priority

## Priority 1

```text
Scan QR
Quote Screen
Payment Confirmation
Payment Processing
```

Core business value.

---

## Priority 2

```text
Login
Register
History
Profile
```

---

## Priority 3

```text
Forgot Password
Change PIN
Change Password
```

Can be implemented later if necessary.

---

# 5. Development Notes

For MVP:

```text
Focus on:
Scan
Quote
Pay
Success
```

Everything else is supporting functionality.

The primary success metric is:

Traveler can complete a VietQR payment using USDT in less than 10 seconds.
