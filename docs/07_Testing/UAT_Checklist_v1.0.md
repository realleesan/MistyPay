# MistyPay - UAT Checklist Document

> Version: 1.0
> Status: Draft - MVP Acceptance
> Product: MistyPay
> Last Updated: 2026

---

# 1. Document Purpose

This document defines the User Acceptance Testing (UAT) checklist for MistyPay MVP.

Objectives:

- Validate business requirements
- Validate user experience
- Validate payment flow
- Validate payout flow
- Determine MVP release readiness

---

# 2. UAT Principles

The MVP is accepted only if:

```text
A traveler can complete a payment
using USDT and the merchant receives VND
without manual intervention.
```

---

# 3. UAT Participants

## Product Owner

```text
Founder
Business Reviewer
```

---

## Internal Testers

```text
Friend A
Friend B
Friend C
```

---

## Pilot Users (Optional)

```text
Foreign travelers
Trusted merchants
```

---

# 4. UAT Environment

Environment:

```text
Staging
```

or

```text
Production (Controlled Testing)
```

---

Requirements:

```text
Working API
Working Database
Working Blockchain Monitoring
Working Payout Integration
```

---

# 5. Authentication Checklist

## Registration

| Item                           | Result |
| ------------------------------ | ------ |
| User can register successfully | ☐     |
| Duplicate email blocked        | ☐     |
| Invalid email blocked          | ☐     |

---

## Login

| Item                         | Result |
| ---------------------------- | ------ |
| User can login successfully  | ☐     |
| Invalid password rejected    | ☐     |
| Session persists after login | ☐     |

---

## Security

| Item                  | Result |
| --------------------- | ------ |
| PIN can be created    | ☐     |
| PIN validation works  | ☐     |
| Incorrect PIN blocked | ☐     |

---

# 6. QR Flow Checklist

| Item                                     | Result |
| ---------------------------------------- | ------ |
| Camera permission works                  | ☐     |
| Valid VietQR can be scanned              | ☐     |
| Merchant information displayed correctly | ☐     |
| Invalid QR rejected                      | ☐     |
| Unsupported QR rejected                  | ☐     |

---

# 7. Quote Flow Checklist

| Item                                | Result |
| ----------------------------------- | ------ |
| User can enter VND amount           | ☐     |
| Exchange rate displayed correctly   | ☐     |
| Service fee displayed correctly     | ☐     |
| Total USDT calculated correctly     | ☐     |
| Quote expires after configured time | ☐     |
| Expired quote cannot continue       | ☐     |

---

# 8. Payment Flow Checklist

## Happy Path

| Item                             | Result |
| -------------------------------- | ------ |
| Payment order created            | ☐     |
| Wallet address displayed         | ☐     |
| Required USDT displayed          | ☐     |
| Payment status updates correctly | ☐     |
| Success screen displayed         | ☐     |

---

## Failure Path

| Item                              | Result |
| --------------------------------- | ------ |
| Expired payment handled correctly | ☐     |
| Underpaid payment detected        | ☐     |
| Overpaid payment detected         | ☐     |
| Duplicate transaction prevented   | ☐     |

---

# 9. Blockchain Checklist

| Item                        | Result |
| --------------------------- | ------ |
| Correct USDT detected       | ☐     |
| Wrong token detected        | ☐     |
| Wrong network detected      | ☐     |
| Duplicate tx_hash prevented | ☐     |
| Detection time acceptable   | ☐     |

---

Target:

```text
Detection < 10 seconds
```

---

# 10. Payout Checklist

| Item                             | Result |
| -------------------------------- | ------ |
| Payout job created automatically | ☐     |
| Merchant receives VND            | ☐     |
| Successful payout updates status | ☐     |
| Failed payout triggers retry     | ☐     |
| Duplicate payout prevented       | ☐     |

---

Target:

```text
Merchant receives money successfully
```

---

# 11. Transaction History Checklist

| Item                       | Result |
| -------------------------- | ------ |
| Transaction list loads     | ☐     |
| Status displayed correctly | ☐     |
| Amount displayed correctly | ☐     |
| Transaction detail loads   | ☐     |

---

# 12. Notification Checklist

| Item                                  | Result |
| ------------------------------------- | ------ |
| Payment success notification received | ☐     |
| Payment failure notification received | ☐     |
| Notification content understandable   | ☐     |

---

# 13. Admin Checklist

| Item                               | Result |
| ---------------------------------- | ------ |
| Admin login works                  | ☐     |
| Admin can view transactions        | ☐     |
| Admin can view payout status       | ☐     |
| Admin can view manual review queue | ☐     |

---

# 14. Reconciliation Checklist

| Item                                  | Result |
| ------------------------------------- | ------ |
| Blockchain records match database     | ☐     |
| Payout records match database         | ☐     |
| Treasury balances verified            | ☐     |
| Daily reconciliation report generated | ☐     |

---

# 15. Security Checklist

| Item                                          | Result |
| --------------------------------------------- | ------ |
| Protected APIs require authentication         | ☐     |
| User cannot access another user's transaction | ☐     |
| JWT expiration handled correctly              | ☐     |
| Rate limiting works                           | ☐     |

---

# 16. Performance Checklist

## API

| Item                      | Result |
| ------------------------- | ------ |
| API response acceptable   | ☐     |
| No major timeout observed | ☐     |

---

Target:

```text
< 500ms average response
```

---

## Payment

| Item                           | Result |
| ------------------------------ | ------ |
| Payment completes successfully | ☐     |
| Status updates promptly        | ☐     |

---

Target:

```text
< 10 seconds
```

---

# 17. Critical Acceptance Criteria

The MVP MUST satisfy all items below.

| Requirement               | Result |
| ------------------------- | ------ |
| Scan VietQR               | ☐     |
| Generate Quote            | ☐     |
| Create Payment            | ☐     |
| Detect USDT               | ☐     |
| Trigger Payout            | ☐     |
| Merchant Receives VND     | ☐     |
| Prevent Duplicate Payout  | ☐     |
| Handle Underpaid Payment  | ☐     |
| Handle Overpaid Payment   | ☐     |
| Transaction History Works | ☐     |

---

# 18. Release Readiness Assessment

## Ready For Internal TestFlight

Conditions:

```text
All Critical Acceptance Criteria Pass
No Critical Bugs
No High Severity Financial Bugs
```

---

## Ready For Pilot Users

Conditions:

```text
Internal TestFlight Stable
Successful Real Transactions Completed
Treasury Monitoring Working
```

---

## Ready For Public Launch

Conditions:

```text
Pilot Users Successful
No Major Financial Issues
Operational Monitoring Stable
```

---

# 19. UAT Sign-Off

## Product Owner

Name:

```text
_____________________
```

Date:

```text
_____________________
```

Decision:

```text
☐ Approved

☐ Approved With Conditions

☐ Rejected
```

---

# 20. Final UAT Question

Before approving release:

```text
If 100 foreign travelers use MistyPay tomorrow,
am I confident that:

1. Their USDT will be detected correctly?
2. Merchants will receive VND correctly?
3. No money will disappear?
4. Duplicate payouts cannot happen?
```

If the answer is YES for all four questions:

```text
MistyPay MVP is ready for release.
```
