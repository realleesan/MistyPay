# MistyPay - API Error Codes Document

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> API Style: REST API
> Last Updated: 2026

---

# 1. Document Purpose

This document defines standardized API error codes for MistyPay.

Objectives:

- Standardize backend error responses
- Help frontend display correct messages
- Improve debugging
- Support AI-assisted development
- Reduce inconsistent error handling

---

# 2. Standard Error Response

All API errors should follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PIN",
    "message": "Incorrect PIN.",
    "details": {}
  }
}
```

---

# 3. Error Categories

```text
AUTH
USER
VALIDATION
QR
QUOTE
PAYMENT
BLOCKCHAIN
PAYOUT
RATE
SYSTEM
ADMIN
```

---

# 4. Authentication Errors

| Code                      | HTTP Status | User Message                                       |
| ------------------------- | ----------: | -------------------------------------------------- |
| AUTH_INVALID_CREDENTIALS  |         401 | Invalid email or password.                         |
| AUTH_TOKEN_EXPIRED        |         401 | Your session has expired. Please sign in again.    |
| AUTH_TOKEN_INVALID        |         401 | Invalid session. Please sign in again.             |
| AUTH_UNAUTHORIZED         |         401 | You need to sign in first.                         |
| AUTH_FORBIDDEN            |         403 | You do not have permission to perform this action. |
| AUTH_EMAIL_ALREADY_EXISTS |         409 | This email is already registered.                  |
| AUTH_EMAIL_NOT_FOUND      |         404 | Email not found.                                   |
| AUTH_OTP_INVALID          |         400 | Invalid verification code.                         |
| AUTH_OTP_EXPIRED          |         400 | Verification code expired.                         |
| AUTH_PIN_INVALID          |         400 | Incorrect PIN.                                     |
| AUTH_PIN_NOT_SET          |         400 | Please set up your PIN first.                      |
| AUTH_TOO_MANY_ATTEMPTS    |         429 | Too many attempts. Please try again later.         |

---

# 5. User Errors

| Code                       | HTTP Status | User Message                     |
| -------------------------- | ----------: | -------------------------------- |
| USER_NOT_FOUND             |         404 | User not found.                  |
| USER_SUSPENDED             |         403 | Your account has been suspended. |
| USER_INACTIVE              |         403 | Your account is not active.      |
| USER_PROFILE_UPDATE_FAILED |         400 | Unable to update profile.        |

---

# 6. Validation Errors

| Code                        | HTTP Status | User Message                         |
| --------------------------- | ----------: | ------------------------------------ |
| VALIDATION_REQUIRED_FIELD   |         400 | Required field is missing.           |
| VALIDATION_INVALID_EMAIL    |         400 | Invalid email address.               |
| VALIDATION_INVALID_AMOUNT   |         400 | Invalid amount.                      |
| VALIDATION_AMOUNT_TOO_LOW   |         400 | Amount is too low.                   |
| VALIDATION_AMOUNT_TOO_HIGH  |         400 | Amount is too high.                  |
| VALIDATION_INVALID_COUNTRY  |         400 | Invalid country.                     |
| VALIDATION_INVALID_PASSWORD |         400 | Password does not meet requirements. |
| VALIDATION_INVALID_PIN      |         400 | PIN must be 6 digits.                |

---

# 7. QR Errors

| Code                    | HTTP Status | User Message                    |
| ----------------------- | ----------: | ------------------------------- |
| QR_INVALID              |         400 | Invalid QR code.                |
| QR_UNSUPPORTED          |         400 | This QR code is not supported.  |
| QR_PARSE_FAILED         |         400 | Unable to read this QR code.    |
| QR_BANK_NOT_SUPPORTED   |         400 | This bank is not supported yet. |
| QR_MISSING_BANK_INFO    |         400 | Bank information is missing.    |
| QR_MISSING_ACCOUNT_INFO |         400 | Account information is missing. |

---

# 8. Rate Errors

| Code                      | HTTP Status | User Message                              |
| ------------------------- | ----------: | ----------------------------------------- |
| RATE_PROVIDER_UNAVAILABLE |         503 | Exchange rate is temporarily unavailable. |
| RATE_NOT_FOUND            |         404 | Exchange rate not found.                  |
| RATE_EXPIRED              |         400 | Exchange rate expired. Please refresh.    |
| RATE_OVERRIDE_INVALID     |         400 | Invalid rate value.                       |

---

# 9. Quote Errors

| Code                 | HTTP Status | User Message                                 |
| -------------------- | ----------: | -------------------------------------------- |
| QUOTE_NOT_FOUND      |         404 | Quote not found.                             |
| QUOTE_EXPIRED        |         400 | Quote expired. Please refresh and try again. |
| QUOTE_ALREADY_USED   |         409 | Quote has already been used.                 |
| QUOTE_CREATE_FAILED  |         500 | Unable to create quote.                      |
| QUOTE_AMOUNT_INVALID |         400 | Invalid quote amount.                        |
| QUOTE_RATE_CHANGED   |         409 | Exchange rate changed. Please refresh quote. |

---

# 10. Payment Errors

| Code                      | HTTP Status | User Message                                   |
| ------------------------- | ----------: | ---------------------------------------------- |
| PAYMENT_NOT_FOUND         |         404 | Payment not found.                             |
| PAYMENT_CREATE_FAILED     |         500 | Unable to create payment.                      |
| PAYMENT_ALREADY_EXISTS    |         409 | Payment already exists.                        |
| PAYMENT_EXPIRED           |         400 | Payment expired.                               |
| PAYMENT_ALREADY_COMPLETED |         409 | Payment already completed.                     |
| PAYMENT_CANCELLED         |         400 | Payment has been cancelled.                    |
| PAYMENT_INVALID_STATUS    |         400 | Payment cannot be processed in current status. |
| PAYMENT_UNDERPAID         |         400 | Payment amount is lower than required.         |
| PAYMENT_OVERPAID          |         400 | Payment amount is higher than required.        |
| PAYMENT_MANUAL_REVIEW     |         202 | Payment is under review.                       |
| PAYMENT_TIMEOUT           |         408 | Payment timed out.                             |

---

# 11. Blockchain Errors

| Code                            | HTTP Status | User Message                                   |
| ------------------------------- | ----------: | ---------------------------------------------- |
| BLOCKCHAIN_PROVIDER_UNAVAILABLE |         503 | Blockchain service is temporarily unavailable. |
| BLOCKCHAIN_TX_NOT_FOUND         |         404 | Payment transaction not found.                 |
| BLOCKCHAIN_TX_INVALID           |         400 | Invalid blockchain transaction.                |
| BLOCKCHAIN_TX_DUPLICATE         |         409 | Transaction already processed.                 |
| BLOCKCHAIN_WRONG_NETWORK        |         400 | Wrong blockchain network.                      |
| BLOCKCHAIN_WRONG_TOKEN          |         400 | Unsupported token.                             |
| BLOCKCHAIN_WRONG_WALLET         |         400 | Payment sent to wrong wallet.                  |
| BLOCKCHAIN_AMOUNT_MISMATCH      |         400 | Payment amount does not match.                 |
| BLOCKCHAIN_CONFIRMATION_PENDING |         202 | Payment confirmation is pending.               |

---

# 12. Payout Errors

| Code                          | HTTP Status | User Message                               |
| ----------------------------- | ----------: | ------------------------------------------ |
| PAYOUT_CREATE_FAILED          |         500 | Unable to create payout.                   |
| PAYOUT_PROVIDER_UNAVAILABLE   |         503 | Payout service is temporarily unavailable. |
| PAYOUT_INSUFFICIENT_BALANCE   |         400 | Payout is temporarily unavailable.         |
| PAYOUT_INVALID_BANK_ACCOUNT   |         400 | Invalid bank account.                      |
| PAYOUT_BANK_NOT_SUPPORTED     |         400 | Bank is not supported.                     |
| PAYOUT_TIMEOUT                |         408 | Payout request timed out.                  |
| PAYOUT_FAILED                 |         500 | Payout failed.                             |
| PAYOUT_ALREADY_SUCCESS        |         409 | Payout already completed.                  |
| PAYOUT_RETRY_LIMIT_REACHED    |         400 | Payout retry limit reached.                |
| PAYOUT_MANUAL_REVIEW_REQUIRED |         202 | Payout is under review.                    |

---

# 13. Admin Errors

| Code                     | HTTP Status | User Message                      |
| ------------------------ | ----------: | --------------------------------- |
| ADMIN_NOT_FOUND          |         404 | Admin not found.                  |
| ADMIN_FORBIDDEN          |         403 | You do not have admin permission. |
| ADMIN_INVALID_ROLE       |         400 | Invalid admin role.               |
| ADMIN_ACTION_NOT_ALLOWED |         403 | This action is not allowed.       |

---

# 14. System Errors

| Code                       | HTTP Status | User Message                               |
| -------------------------- | ----------: | ------------------------------------------ |
| SYSTEM_INTERNAL_ERROR      |         500 | Something went wrong. Please try again.    |
| SYSTEM_SERVICE_UNAVAILABLE |         503 | Service temporarily unavailable.           |
| SYSTEM_TIMEOUT             |         408 | Request timed out. Please try again.       |
| SYSTEM_RATE_LIMITED        |         429 | Too many requests. Please try again later. |
| SYSTEM_MAINTENANCE         |         503 | System is under maintenance.               |

---

# 15. Error Handling Rules

## Rule 1 - Do Not Expose Technical Details

Do not show raw provider errors to users.

Use:

```text
Service temporarily unavailable.
```

Avoid:

```text
BaoKim returned error code 5001.
```

---

## Rule 2 - Log Full Error Internally

Internal logs should include:

```text
error_code
raw_error
provider_response
request_id
user_id
payment_id
```

---

## Rule 3 - User Message Must Be Friendly

Use:

```text
Payment is under review.
```

Avoid:

```text
PAYOUT_FAILED_MAX_RETRY_EXCEPTION
```

---

# 16. Frontend Error Mapping

## Auth

```text
AUTH_INVALID_CREDENTIALS
→ Show login error
```

---

## QR

```text
QR_INVALID
→ Show retry scan message
```

---

## Quote

```text
QUOTE_EXPIRED
→ Show refresh quote button
```

---

## Payment

```text
PAYMENT_EXPIRED
→ Navigate Payment Failed Screen
```

---

## Payout

```text
PAYOUT_MANUAL_REVIEW_REQUIRED
→ Show Under Review status
```

---

# 17. Retryable Errors

The following errors may be retried:

```text
RATE_PROVIDER_UNAVAILABLE
BLOCKCHAIN_PROVIDER_UNAVAILABLE
PAYOUT_PROVIDER_UNAVAILABLE
PAYOUT_TIMEOUT
SYSTEM_TIMEOUT
SYSTEM_SERVICE_UNAVAILABLE
```

---

# 18. Non-Retryable Errors

The following errors should not be retried automatically:

```text
AUTH_INVALID_CREDENTIALS
AUTH_PIN_INVALID
QR_INVALID
QUOTE_EXPIRED
PAYMENT_UNDERPAID
PAYMENT_OVERPAID
BLOCKCHAIN_WRONG_NETWORK
BLOCKCHAIN_WRONG_TOKEN
PAYOUT_INVALID_BANK_ACCOUNT
```

---

# 19. Error Code Naming Convention

Format:

```text
CATEGORY_REASON
```

Examples:

```text
AUTH_INVALID_CREDENTIALS
PAYMENT_EXPIRED
PAYOUT_FAILED
BLOCKCHAIN_TX_DUPLICATE
```

---

# 20. MVP Priority Error Codes

The most important error codes for MVP:

```text
AUTH_INVALID_CREDENTIALS
AUTH_PIN_INVALID
QR_INVALID
QUOTE_EXPIRED
PAYMENT_EXPIRED
PAYMENT_UNDERPAID
PAYMENT_OVERPAID
BLOCKCHAIN_TX_DUPLICATE
PAYOUT_FAILED
PAYOUT_MANUAL_REVIEW_REQUIRED
SYSTEM_INTERNAL_ERROR
```
