# MistyPay - AI Project Context

> Version: 1.0
> Status: Active
> Purpose: AI & Developer Onboarding Guide
> Last Updated: 2026

---

# 1. Purpose

This document is the primary entry point for:

```text
AI Assistants

Developers

Future Contributors

Technical Reviewers
```

Before making any code, architecture or product changes, this document should be read first.

---

# 2. Project Overview

## Product Name

```text
MistyPay
```

---

## Product Type

```text
Payment Facilitation Platform
```

---

## Core Flow

```text
User
↓
Pay USDT (TRC20)
↓
MistyPay verifies transaction
↓
Treasury settlement
↓
Merchant receives VND
```

---

## MVP Objective

Provide a simple and reliable bridge between:

```text
USDT Payments

and

Merchant VND Settlements
```

---

# 3. Product Philosophy

Priority order:

```text
Security

Treasury Protection

Financial Accuracy

Operational Reliability

User Experience
```

---

Core principle:

```text
No payout before confirmed funds.
```

---

# 4. Source of Truth

If documents conflict, follow this order:

## Level 1

```text
Product_Decisions_Log.md
```

Highest priority.

---

## Level 2

```text
PRD_v1.0.md

Business_Rules_v1.0.md
```

---

## Level 3

```text
State_Machine_v1.0.md

Event_Driven_Architecture_v1.0.md
```

---

## Level 4

```text
Database_Design_v1.0.md

API_Specification_v1.0.md
```

---

Rule:

```text
Product Decisions Log overrides all other documents.
```

---

# 5. Required Reading Order

## Step 1

Read:

```text
01_Product/
```

Files:

```text
PRD_v1.0.md

Product_Decisions_Log.md

User_Flow_v1.0.md

Use_Cases_v1.0.md
```

---

## Step 2

Read:

```text
02_Architecture/
```

Files:

```text
System_Architecture_v1.0.md

Database_Design_v1.0.md

State_Machine_v1.0.md

Event_Driven_Architecture_v1.0.md

Blockchain_Process_v1.0.md

External_Integrations_v1.0.md
```

---

## Step 3

Read:

```text
05_Operations/
```

Files:

```text
Business_Rules_v1.0.md

Treasury_Management_v1.0.md

Fraud_Risk_Management_v1.0.md
```

---

## Step 4

Read:

```text
04_API/
```

Files:

```text
API_Specification_v1.0.md

API_Error_Codes_v1.0.md

Webhook_Specification_v1.0.md
```

---

## Step 5

Read:

```text
06_Infrastructure/
```

---

## Step 6

Read:

```text
07_Testing/
```

---

# 6. MVP Scope

## Included

```text
TRC20 USDT

Merchant Settlement

BaoKim Payout

Telegram Monitoring

Manual Treasury Operations

Manual Rate Management

iOS Application
```

---

## Excluded

```text
KYC

AML

Multi-Chain

Multi-Currency

Automatic FX

Android Release

Web Application

Card Payments
```

---

# 7. Technical Stack

## Mobile

```text
React Native

Expo
```

---

## Backend

```text
NestJS
```

---

## Database

```text
PostgreSQL
```

---

## Queue

```text
BullMQ
```

---

## Cache

```text
Redis
```

---

## Infrastructure

```text
Ubuntu VPS

Docker Compose

Nginx
```

---

# 8. External Services

## Critical

```text
TronGrid

BaoKim
```

---

## Operational

```text
Telegram
```

---

## Optional

```text
PayOS
```

---

# 9. Core Business Rules

## Rule 1

```text
No payout before USDT confirmation.
```

---

## Rule 2

```text
One payment
=
One payout
```

---

## Rule 3

```text
Duplicate payout is forbidden.
```

---

## Rule 4

```text
Treasury mismatch triggers investigation.
```

---

## Rule 5

```text
All financial operations must be auditable.
```

---

# 10. Blockchain Rules

## Supported Network

```text
TRON
```

---

## Supported Token

```text
USDT
```

---

## Detection Method

```text
Polling Worker
```

---

## Not Used

```text
Blockchain Webhooks
```

---

Reason:

```text
Simpler MVP architecture.
```

---

# 11. Treasury Principles

Treasury is the most important operational component.

---

Always protect:

```text
Liquidity

Ledger Integrity

Payout Accuracy
```

---

Priority:

```text
Treasury
>
Growth
```

---

# 12. Risk Principles

When uncertain:

```text
Pause transaction flow.
```

---

When mismatch exists:

```text
Investigate before continuing.
```

---

When fraud suspected:

```text
Manual review first.
```

---

# 13. Architecture Principles

## Event Driven

Core services communicate through events.

---

## State Machine Driven

Payment lifecycle must follow:

```text
Defined state transitions only.
```

---

## Idempotent

All financial operations must be:

```text
Idempotent
```

---

# 14. Development Rules

## Database

Never:

```text
Modify schema
without updating
Database_Design_v1.0.md
```

---

## API

Never:

```text
Add endpoint
without updating
API_Specification_v1.0.md
```

---

## Business Logic

Never:

```text
Change business rules
without updating
Business_Rules_v1.0.md
```

---

## Product Decisions

Every significant decision must be recorded in:

```text
Product_Decisions_Log.md
```

---

# 15. Documentation Maintenance Rules

Whenever code changes affect:

```text
Architecture

Database

API

Business Logic

Treasury

Security
```

Relevant documentation must be updated.

---

# 16. Folder Structure

```text
00_Project_Guide/

01_Product/

02_Architecture/

03_UX/

04_API/

05_Operations/

06_Infrastructure/

07_Testing/

08_Compliance_Legal/

09_Project_Management/
```

---

# 17. Launch Readiness Criteria

Before production:

```text
UAT Completed

Treasury Ready

Monitoring Active

Security Reviewed

Privacy Policy Published

Terms Published

Support Ready
```

---

# 18. Future Roadmap

## Phase 2

```text
Android Release

Push Notifications

Improved Monitoring
```

---

## Phase 3

```text
KYC

AML

Risk Scoring Engine
```

---

## Phase 4

```text
Multi-Chain

Multi-Currency

Treasury Automation
```

---

# 19. AI Instructions

Before writing or modifying code:

```text
1. Read this document

2. Read Product_Decisions_Log

3. Read Business_Rules

4. Read Database_Design

5. Read API_Specification
```

---

If conflicts are detected:

```text
Follow Product_Decisions_Log.
```

---

If documentation is missing:

```text
Request clarification.

Do not invent business logic.
```

---

# 20. Final Principle

For MistyPay:

```text
Product documents define intent.

Architecture documents define structure.

Business rules define behavior.

Source code implements all three.
```

---

```text
Never change the system
without understanding the business flow first.
```
