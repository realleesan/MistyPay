# MistyPay - Product Backlog Document

> Version: 1.0
> Status: Draft
> Product: MistyPay
> Product Owner: Le Vu Bao Nhat
> Last Updated: 2026

---

# 1. Document Purpose

This document defines the complete product backlog for MistyPay.

Objectives:

- Define all product features
- Prioritize development effort
- Support sprint planning
- Support MVP execution
- Maintain a single source of truth

---

# 2. Prioritization Framework

MistyPay uses MoSCoW prioritization.

---

## Must Have

Required for MVP launch.

Without these features:

```text
MVP cannot operate.
```

---

## Should Have

Important but not required.

MVP can launch without them.

---

## Could Have

Nice-to-have.

Future improvements.

---

## Won't Have

Explicitly excluded from MVP.

---

# 3. Must Have Features (MVP)

---

# BG-001

## User Registration

Priority:

```text
Must Have
```

Description:

```text
Allow travelers to create accounts.
```

---

# BG-002

## User Login

Priority:

```text
Must Have
```

Description:

```text
Authenticate users securely.
```

---

# BG-003

## PIN Setup

Priority:

```text
Must Have
```

Description:

```text
Create transaction PIN.
```

---

# BG-004

## QR Scan

Priority:

```text
Must Have
```

Description:

```text
Scan VietQR codes.
```

---

# BG-005

## VietQR Parsing

Priority:

```text
Must Have
```

Description:

```text
Extract merchant information.
```

---

# BG-006

## Quote Generation

Priority:

```text
Must Have
```

Description:

```text
Calculate USDT amount.
```

---

# BG-007

## Exchange Rate Integration

Priority:

```text
Must Have
```

Description:

```text
Retrieve USDT/VND rate.
```

---

# BG-008

## Fee Calculation

Priority:

```text
Must Have
```

Description:

```text
Calculate service fee.
```

---

# BG-009

## Payment Order Creation

Priority:

```text
Must Have
```

Description:

```text
Generate payment order.
```

---

# BG-010

## Blockchain Monitoring

Priority:

```text
Must Have
```

Description:

```text
Monitor TRON wallet.
```

---

# BG-011

## USDT Detection

Priority:

```text
Must Have
```

Description:

```text
Detect incoming payment.
```

---

# BG-012

## Payment Validation

Priority:

```text
Must Have
```

Description:

```text
Validate amount, token and network.
```

---

# BG-013

## Automatic Payout

Priority:

```text
Must Have
```

Description:

```text
Transfer VND to merchant.
```

---

# BG-014

## Retry Failed Payout

Priority:

```text
Must Have
```

Description:

```text
Retry payout automatically.
```

---

# BG-015

## Transaction History

Priority:

```text
Must Have
```

Description:

```text
Display payment history.
```

---

# BG-016

## Transaction Details

Priority:

```text
Must Have
```

Description:

```text
Display payment details.
```

---

# BG-017

## Manual Review Queue

Priority:

```text
Must Have
```

Description:

```text
Handle exceptions.
```

---

# BG-018

## Admin Dashboard

Priority:

```text
Must Have
```

Description:

```text
Monitor operations.
```

---

# BG-019

## Reconciliation

Priority:

```text
Must Have
```

Description:

```text
Verify treasury accuracy.
```

---

# BG-020

## Audit Logs

Priority:

```text
Must Have
```

Description:

```text
Track all critical events.
```

---

# 4. Should Have Features

---

# BG-021

## Push Notifications

Priority:

```text
Should Have
```

Description:

```text
Notify payment status changes.
```

---

# BG-022

## Transaction Search

Priority:

```text
Should Have
```

Description:

```text
Search payment history.
```

---

# BG-023

## Transaction Filters

Priority:

```text
Should Have
```

Description:

```text
Filter by status.
```

---

# BG-024

## Merchant Name Verification

Priority:

```text
Should Have
```

Description:

```text
Show merchant identity clearly.
```

---

# BG-025

## Treasury Dashboard

Priority:

```text
Should Have
```

Description:

```text
Monitor liquidity.
```

---

# BG-026

## Support Center

Priority:

```text
Should Have
```

Description:

```text
Help users solve issues.
```

---

# BG-027

## Analytics Dashboard

Priority:

```text
Should Have
```

Description:

```text
Monitor product performance.
```

---

# 5. Could Have Features

---

# BG-028

## Referral Program

Priority:

```text
Could Have
```

Description:

```text
Invite friends.
```

---

# BG-029

## Promo Codes

Priority:

```text
Could Have
```

Description:

```text
Apply discounts.
```

---

# BG-030

## Cashback Program

Priority:

```text
Could Have
```

Description:

```text
Reward users.
```

---

# BG-031

## Favorite Merchants

Priority:

```text
Could Have
```

Description:

```text
Save frequent merchants.
```

---

# BG-032

## Multi-Language Support

Priority:

```text
Could Have
```

Description:

```text
Support multiple languages.
```

---

# BG-033

## QR Payment Templates

Priority:

```text
Could Have
```

Description:

```text
Store common payment scenarios.
```

---

# 6. Won't Have (MVP)

---

# BG-034

## KYC

Priority:

```text
Won't Have
```

Reason:

```text
Not required for MVP validation.
```

---

# BG-035

## Merchant Portal

Priority:

```text
Won't Have
```

Reason:

```text
MVP focuses on traveler experience.
```

---

# BG-036

## Merchant Mobile App

Priority:

```text
Won't Have
```

Reason:

```text
Existing VietQR ecosystem sufficient.
```

---

# BG-037

## Multi-Chain Support

Priority:

```text
Won't Have
```

Reason:

```text
TRON only for MVP.
```

---

# BG-038

## P2P Transfers

Priority:

```text
Won't Have
```

Reason:

```text
Outside product scope.
```

---

# BG-039

## Cash Withdrawal

Priority:

```text
Won't Have
```

Reason:

```text
Creates regulatory and AML risks.
```

---

# BG-040

## Crypto Swap

Priority:

```text
Won't Have
```

Reason:

```text
Not part of payment experience.
```

---

# 7. Technical Backlog

---

# TECH-001

## NestJS Backend Setup

Priority:

```text
Must Have
```

---

# TECH-002

## PostgreSQL Setup

Priority:

```text
Must Have
```

---

# TECH-003

## Redis Setup

Priority:

```text
Must Have
```

---

# TECH-004

## BullMQ Setup

Priority:

```text
Must Have
```

---

# TECH-005

## TronGrid Integration

Priority:

```text
Must Have
```

---

# TECH-006

## BaoKim Integration

Priority:

```text
Must Have
```

---

# TECH-007

## Logging Infrastructure

Priority:

```text
Must Have
```

---

# TECH-008

## Monitoring Infrastructure

Priority:

```text
Should Have
```

---

# TECH-009

## CI/CD Pipeline

Priority:

```text
Should Have
```

---

# 8. Business Backlog

---

# BUS-001

## Create Landing Page

Priority:

```text
Must Have
```

---

# BUS-002

## Register Apple Developer Account

Priority:

```text
Must Have
```

---

# BUS-003

## TestFlight Setup

Priority:

```text
Must Have
```

---

# BUS-004

## Recruit Initial Testers

Priority:

```text
Should Have
```

---

# BUS-005

## Merchant Outreach

Priority:

```text
Should Have
```

---

# 9. MVP Scope Summary

Included:

```text
Authentication

QR Scan

Quote

Payment

Blockchain

Payout

History

Admin

Reconciliation
```

---

Excluded:

```text
Referral

Cashback

KYC

Merchant Portal

Multi-chain

Crypto Swap
```

---

# 10. Next Planning Step

This backlog serves as input for:

```text
Sprint Planning

Task Breakdown

Release Planning
```

and should be reviewed before every development cycle.
