# MistyPay - Business Rules Document

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> Last Updated: 2026

---

# 1. Document Purpose

This document defines the business rules governing all core operations of MistyPay.

Objectives:

- Centralize business logic
- Standardize system behavior
- Reduce ambiguity during development
- Support risk management
- Support fraud prevention
- Support future compliance reviews

---

# 2. Business Rule Categories

```text
BR-100 Quote Rules

BR-200 Payment Rules

BR-300 Blockchain Rules

BR-400 Payout Rules

BR-500 Treasury Rules

BR-600 Risk & Review Rules

BR-700 User Rules

BR-800 Operational Rules
```

---

# 3. BR-100 Quote Rules

## BR-101 Quote Expiration

A quote remains valid for:

```text
60 seconds
```

After expiration:

```text
Quote cannot be reused.
```

---

## BR-102 Quote Lock

Once a quote is used:

```text
Status = QUOTE_USED
```

and cannot be used again.

---

## BR-103 Exchange Rate Lock

Exchange rate is locked when quote is generated.

Example:

```text
26,000 VND / USDT
```

remains fixed during quote validity.

---

## BR-104 Quote Amount

Minimum:

```text
50,000 VND
```

Maximum:

```text
20,000,000 VND
```

for MVP.

---

# 4. BR-200 Payment Rules

## BR-201 Payment Creation

Payment order may only be created from:

```text
QUOTE_CREATED
```

---

## BR-202 Payment Expiration

Payment expires after:

```text
10 minutes
```

if no valid USDT received.

---

## BR-203 One Quote → One Payment

Rule:

```text
1 Quote
=
1 Payment Order
```

---

## BR-204 Payment Status Integrity

Valid flow:

```text
WAITING_USDT
↓
USDT_DETECTED
↓
USDT_CONFIRMED
```

Only.

---

## BR-205 No Direct Success

Payment cannot become:

```text
SUCCESS
```

without:

```text
USDT_CONFIRMED
```

---

# 5. BR-300 Blockchain Rules

## BR-301 Supported Network

MVP supports:

```text
TRON (TRC20)
```

only.

---

## BR-302 Supported Token

MVP supports:

```text
USDT
```

only.

---

## BR-303 Transaction Matching

A transaction must match:

```text
Expected Amount

Expected Wallet

Expected Time Window
```

---

## BR-304 Duplicate Transaction

Same:

```text
tx_hash
```

may only be processed once.

---

## BR-305 Confirmation Requirement

Required confirmations:

```text
1
```

for MVP.

---

# 6. BR-400 Payout Rules

## BR-401 Payout Eligibility

Payout may only start after:

```text
USDT_CONFIRMED
```

---

## BR-402 Available Liquidity

Payout requires:

```text
Available Balance
>=
Required Amount
```

---

## BR-403 Payout Retry

Maximum retries:

```text
3
```

---

## BR-404 Retry Interval

Retry delay:

```text
60 seconds
```

---

## BR-405 Retry Exhausted

After max retry:

```text
MANUAL_REVIEW
```

---

## BR-406 One Payment → One Payout

Rule:

```text
1 Payment
=
1 Payout
```

---

# 7. BR-500 Treasury Rules

## BR-501 Treasury Source of Truth

Treasury balance must be calculated from:

```text
Ledger
```

and verified against:

```text
Actual Balance
```

---

## BR-502 Treasury Reconciliation

Required:

```text
Daily
```

---

## BR-503 Low Balance Warning

Trigger:

```text
VND < 20,000,000
```

---

## BR-504 Critical Balance

Trigger:

```text
VND < 5,000,000
```

---

## BR-505 Treasury Freeze

System may stop new transactions when:

```text
Critical Balance
```

or

```text
Treasury Mismatch
```

---

# 8. BR-600 Risk & Review Rules

## BR-601 Underpaid Payment

Condition:

```text
Received USDT
<
Required USDT
```

Result:

```text
MANUAL_REVIEW
```

---

## BR-602 Overpaid Payment

Condition:

```text
Received USDT
>
Required USDT
```

Result:

```text
MANUAL_REVIEW
```

---

## BR-603 Late Payment

Condition:

```text
USDT received after expiration
```

Result:

```text
MANUAL_REVIEW
```

---

## BR-604 Treasury Mismatch

Condition:

```text
Ledger Balance
≠
Actual Balance
```

Result:

```text
Critical Investigation
```

---

## BR-605 Duplicate Payout Detection

Condition:

```text
Same payment_id
attempts multiple payouts
```

Result:

```text
Reject
Alert
Audit
```

---

# 9. BR-700 User Rules

## BR-701 User Registration

Required:

```text
Email
Password
```

---

## BR-702 Password Policy

Minimum:

```text
8 characters
```

Recommended:

```text
12+
```

---

## BR-703 PIN Requirement

Every financial operation requires:

```text
PIN Verification
```

---

## BR-704 PIN Lock

After:

```text
5 failures
```

Lock:

```text
15 minutes
```

---

# 10. BR-800 Operational Rules

## BR-801 Audit Logging

Required for:

```text
USDT Confirmation

Payout Processing

Payout Success

Manual Review
```

---

## BR-802 Monitoring

Critical alerts:

```text
Treasury Mismatch

Duplicate Payout

Critical Balance
```

---

## BR-803 Incident Escalation

Severity Levels:

```text
P1
P2
P3
```

Defined in Incident Response Plan.

---

# 11. Financial Tolerance Rules

## BR-901 Amount Tolerance

Allowed difference:

```text
± 0.01 USDT
```

---

Example:

Required:

```text
19.43 USDT
```

Accepted:

```text
19.42 - 19.44 USDT
```

---

Outside range:

```text
MANUAL_REVIEW
```

---

# 12. Exchange Rate Rules

## BR-1001 Rate Source

MVP:

```text
Internal Rate
```

managed by admin.

---

## BR-1002 Rate Update

Admin may update rate at any time.

---

## BR-1003 Active Rate

Newest active rate is used for:

```text
Quote Generation
```

only.

---

## BR-1004 Rate Lock

Quote retains rate even if:

```text
New Rate Published
```

during validity period.

---

# 13. Manual Review Rules

## BR-1101 Review Creation

Automatically create review when:

```text
Underpaid
Overpaid
Late Payment
Retry Exhausted
```

---

## BR-1102 Review Ownership

Every review must be assigned.

---

## BR-1103 Review Resolution

Possible outcomes:

```text
Approve
Reject
Refund Required
```

---

# 14. Administrative Rules

## BR-1201 Admin Actions

All actions must be logged.

---

## BR-1202 Treasury Actions

Require:

```text
ADMIN role
```

---

## BR-1203 Configuration Changes

Require audit logging.

---

# 15. Future Rules

Future versions may introduce:

```text
KYC Rules

AML Rules

Transaction Limits

Country Restrictions

Risk Scoring
```

Not required for MVP.

---

# 16. Rule Priority

When rules conflict:

Priority:

```text
Security
↓
Treasury Protection
↓
Financial Accuracy
↓
User Convenience
```

---

# 17. Rule Governance

Any change to business rules must:

```text
Be documented

Be reviewed

Be versioned
```

---

# 18. Business Rule Summary

Critical Rules:

```text
Quote = 60 seconds

Payment = 10 minutes

TRC20 only

USDT only

3 payout retries

Daily reconciliation

Treasury freeze on critical issues

No payout without USDT_CONFIRMED
```

---

# 19. Core Principle

For MistyPay:

```text
Business Rules
define what is allowed.

State Machines
define how it moves.

Events
define when it moves.
```

---

```text
Every financial action
must obey all three.
```
