# MistyPay - Product Decisions Log

> Version: 1.0
> Status: Active
> Product: MistyPay
> Product Owner: Le Vu Bao Nhat
> Purpose: Record major product, business, architecture, and technical decisions throughout the lifecycle of MistyPay.

---

# Introduction

This document records important decisions made during the development of MistyPay.

Objectives:

- Preserve decision history
- Capture rationale behind decisions
- Avoid repeated discussions
- Provide context for future team members
- Support AI-assisted development

---

# Decision Status Definitions

## Proposed

Decision is under discussion.

```text
PROPOSED
```

---

## Accepted

Decision has been approved.

```text
ACCEPTED
```

---

## Rejected

Decision has been rejected.

```text
REJECTED
```

---

## Deprecated

Decision was previously accepted but replaced later.

```text
DEPRECATED
```

---

# Product Decisions

---

# PD-001

## Title

MistyPay targets international travelers instead of Vietnamese users.

## Date

2026-06

## Category

Product Strategy

## Status

```text
ACCEPTED
```

## Decision

The primary target audience will be:

```text
International Travelers
Digital Nomads
Expats
```

instead of Vietnamese domestic users.

## Reason

```text
Clearer pain point
Less competition
Better product positioning
Higher willingness to pay fees
```

## Impact

```text
UI must support English-first experience
Travel-focused branding
Simple onboarding
```

---

# PD-002

## Title

Merchant does not need MistyPay account.

## Date

2026-06

## Category

Business Model

## Status

```text
ACCEPTED
```

## Decision

Merchants will not be required to:

```text
Register
Install App
Create Wallet
```

## Reason

Reduce merchant adoption friction.

## Impact

Merchant only needs:

```text
Existing VietQR
```

---

# PD-003

## Title

MistyPay focuses on VietQR payment flow.

## Date

2026-06

## Category

Product Scope

## Status

```text
ACCEPTED
```

## Decision

MVP only supports:

```text
VietQR
```

## Not Included

```text
Card Payments
POS Payments
Bank Transfer Initiation
```

## Reason

Maintain focused MVP scope.

---

# PD-004

## Title

No KYC in MVP.

## Date

2026-06

## Category

Compliance

## Status

```text
ACCEPTED
```

## Decision

MVP will not implement KYC.

## Reason

```text
Reduce development complexity
Faster validation
Smaller operational burden
```

## Future Review

Required before public scaling.

---

# PD-005

## Title

Payment experience should hide blockchain complexity.

## Date

2026-06

## Category

UX

## Status

```text
ACCEPTED
```

## Decision

Users should experience:

```text
Scan
Pay
Done
```

instead of:

```text
Wallet
Gas
Blockchain
Hash
```

## Reason

Most travelers are not crypto experts.

---

# Branding Decisions

---

# PD-006

## Title

Product name is MistyPay.

## Date

2026-06

## Category

Branding

## Status

```text
ACCEPTED
```

## Decision

Official product name:

```text
MistyPay
```

## Alternatives Considered

```text
RoamPay
NomadPay
GoLocal
```

## Reason

```text
Leverages existing Misty brand
Simple
Easy to remember
Suitable for fintech
```

---

# PD-007

## Title

Primary brand colors.

## Date

2026-06

## Category

Branding

## Status

```text
ACCEPTED
```

## Decision

Primary colors:

```text
Blue
White
```

## Reason

Consistent with Misty Team branding.

---

# Architecture Decisions

---

# PD-008

## Title

Use Modular Monolith architecture.

## Date

2026-06

## Category

Architecture

## Status

```text
ACCEPTED
```

## Decision

Backend architecture:

```text
Modular Monolith
```

## Alternatives Considered

```text
Microservices
```

## Reason

```text
Solo founder
Lower complexity
Faster development
Lower infrastructure cost
```

---

# PD-009

## Title

Use NestJS for backend.

## Date

2026-06

## Category

Architecture

## Status

```text
ACCEPTED
```

## Decision

Backend framework:

```text
NestJS
```

## Reason

```text
TypeScript
Modular
Scalable
AI-friendly
```

---

# PD-010

## Title

Use PostgreSQL.

## Date

2026-06

## Category

Database

## Status

```text
ACCEPTED
```

## Decision

Primary database:

```text
PostgreSQL
```

## Reason

```text
Reliable
Strong transactional support
Suitable for financial systems
```

---

# PD-011

## Title

Use Redis + BullMQ.

## Date

2026-06

## Category

Architecture

## Status

```text
ACCEPTED
```

## Decision

Queue system:

```text
Redis
BullMQ
```

## Reason

Required for:

```text
Payout Jobs
Blockchain Monitoring
Notifications
Retries
```

---

# Blockchain Decisions

---

# PD-012

## Title

Use TRON network for MVP.

## Date

2026-06

## Category

Blockchain

## Status

```text
ACCEPTED
```

## Decision

Supported network:

```text
TRON
```

Supported asset:

```text
USDT TRC20
```

## Alternatives Considered

```text
Solana
Polygon
Ethereum
```

## Reason

```text
Popular among travelers
Widely used for USDT
Low transaction fees
Mature ecosystem
```

---

# PD-013

## Title

Single-chain strategy for MVP.

## Date

2026-06

## Category

Blockchain

## Status

```text
ACCEPTED
```

## Decision

MVP supports:

```text
TRON only
```

## Reason

Reduce complexity.

---

# Payment Decisions

---

# PD-014

## Title

Use BaoKim liquidity pool.

## Date

2026-06

## Category

Treasury

## Status

```text
ACCEPTED
```

## Decision

Initial VND liquidity source:

```text
BaoKim Wallet
```

## Reason

Existing experience
Existing payout integration

---

# PD-015

## Title

Payout provider.

## Date

2026-06

## Category

Payment

## Status

```text
ACCEPTED
```

## Decision

Primary payout providers:

```text
BaoKim
PayOS
```

## Reason

Existing familiarity
Vietnam bank coverage

---

# Product Experience Decisions

---

# PD-016

## Title

Quote expiration.

## Date

2026-06

## Category

Product Logic

## Status

```text
ACCEPTED
```

## Decision

Quote validity:

```text
60 seconds
```

## Reason

Protect exchange rate accuracy.

---

# PD-017

## Title

Payment order expiration.

## Date

2026-06

## Category

Product Logic

## Status

```text
ACCEPTED
```

## Decision

Payment order validity:

```text
5 minutes
```

## Reason

Balance between:

```text
User convenience
Operational safety
```

---

# PD-018

## Title

Target payment completion time.

## Date

2026-06

## Category

Product KPI

## Status

```text
ACCEPTED
```

## Decision

Target:

```text
< 10 seconds
```

from payment confirmation to successful completion.

---

# Future Considerations

---

# PD-019

## Title

Merchant Portal.

## Status

```text
PROPOSED
```

## Decision

May be introduced after MVP validation.

---

# PD-020

## Title

Referral Program.

## Status

```text
PROPOSED
```

## Decision

May be introduced in V1.1.

---

# PD-021

## Title

Multi-country support.

## Status

```text
PROPOSED
```

## Decision

Potential expansion:

```text
Thailand
Indonesia
Philippines
Malaysia
```

after Vietnam validation.

---

# PD-022

## Title

Single Settlement Wallet For MVP

## Date

2026-06-14

## Category

Blockchain / Treasury

## Status

```text
ACCEPTED
```

## Decision

All incoming USDT payments are sent to one shared settlement wallet.

## Reason

Simpler implementation
Lower operational cost
Faster MVP delivery

## Future

Per-order wallet generation may be introduced later.

---

# PD-023

## Title

Liquidity Threshold Alert

## Date

2026-06-14

## Category

Treasury / Operations

## Status

```text
ACCEPTED
```

## Decision

System automatically alerts when BaoKim balance falls below configured threshold.

## Initial Threshold

```text
5,000,000 VND
```

## Reason

Prevents running out of liquidity
Allows manual intervention before critical state
Simple to implement
Low maintenance cost

## Future

Configurable threshold
Multi-currency support
Automated top-up triggers

---

# Decision Review Process

For every major change:

```text
1. Create New Decision
2. Assign Unique ID
3. Record Date
4. Record Reason
5. Record Impact
6. Set Status
```

Never overwrite historical decisions.

If a decision changes:

```text
Old Decision
↓
DEPRECATED

New Decision
↓
ACCEPTED
```

This preserves product history and context.
