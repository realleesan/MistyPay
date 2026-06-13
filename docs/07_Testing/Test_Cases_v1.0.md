# MistyPay - Test Cases Document

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> Last Updated: 2026

---

# 1. Document Purpose

This document defines core test cases for MistyPay MVP.

Objectives:

- Validate functional correctness
- Validate transaction safety
- Validate payout reliability
- Validate blockchain handling
- Support QA testing
- Support AI-assisted development

---

# 2. Test Case Format

Each test case follows:

```text
Test Case ID
Scenario
Preconditions
Steps
Expected Result
Priority
```

---

# 3. Authentication Test Cases

---

# TC-AUTH-001

## Scenario

User registers successfully.

## Preconditions

```text
Email does not exist
```

## Steps

```text
1. Open Register screen
2. Enter valid email
3. Enter valid password
4. Select country
5. Submit registration
```

## Expected Result

```text
Account is created
User can login
```

## Priority

```text
High
```

---

# TC-AUTH-002

## Scenario

User login successfully.

## Preconditions

```text
User account exists
```

## Steps

```text
1. Open Login screen
2. Enter valid email
3. Enter valid password
4. Submit login
```

## Expected Result

```text
Access token returned
User navigates to Home screen
```

## Priority

```text
High
```

---

# TC-AUTH-003

## Scenario

User enters wrong password.

## Expected Result

```text
Login fails
Error displayed:
Invalid email or password.
```

## Priority

```text
Medium
```

---

# TC-AUTH-004

## Scenario

User enters incorrect PIN when confirming payment.

## Preconditions

```text
User logged in
PIN already set
Payment confirmation screen opened
```

## Expected Result

```text
Payment is not created
Error displayed:
Incorrect PIN.
```

## Priority

```text
High
```

---

# 4. QR Test Cases

---

# TC-QR-001

## Scenario

Scan valid VietQR.

## Preconditions

```text
User logged in
Camera permission granted
Valid VietQR available
```

## Steps

```text
1. Open Scan QR screen
2. Scan valid VietQR
```

## Expected Result

```text
QR parsed successfully
Merchant bank information displayed
Navigate to Payment Quote screen
```

## Priority

```text
High
```

---

# TC-QR-002

## Scenario

Scan invalid QR.

## Expected Result

```text
Error displayed:
Invalid QR code.
User can retry scan
```

## Priority

```text
High
```

---

# TC-QR-003

## Scenario

Scan unsupported QR.

## Expected Result

```text
Error displayed:
This QR code is not supported.
```

## Priority

```text
Medium
```

---

# TC-QR-004

## Scenario

QR is missing bank account information.

## Expected Result

```text
QR parsing fails
Error displayed:
Bank information is missing.
```

## Priority

```text
Medium
```

---

# 5. Quote Test Cases

---

# TC-QUOTE-001

## Scenario

Generate valid payment quote.

## Preconditions

```text
Valid merchant information exists
User enters valid VND amount
Rate provider available
```

## Steps

```text
1. Enter 500,000 VND
2. Submit quote request
```

## Expected Result

```text
Quote created
Rate displayed
Fee displayed
Total USDT displayed
Quote expiration timer starts
```

## Priority

```text
High
```

---

# TC-QUOTE-002

## Scenario

Quote expires after 60 seconds.

## Preconditions

```text
Quote created
```

## Steps

```text
1. Wait longer than 60 seconds
2. Try to continue payment
```

## Expected Result

```text
Quote cannot be used
Error displayed:
Quote expired. Please refresh and try again.
```

## Priority

```text
High
```

---

# TC-QUOTE-003

## Scenario

Rate provider unavailable.

## Expected Result

```text
Quote is not created
Error displayed:
Exchange rate is temporarily unavailable.
```

## Priority

```text
High
```

---

# TC-QUOTE-004

## Scenario

User enters invalid amount.

## Input

```text
0 VND
```

## Expected Result

```text
Quote is not created
Error displayed:
Invalid amount.
```

## Priority

```text
Medium
```

---

# 6. Payment Test Cases

---

# TC-PAY-001

## Scenario

Create payment order successfully.

## Preconditions

```text
User logged in
Valid quote exists
PIN is correct
```

## Steps

```text
1. Review quote
2. Enter valid PIN
3. Confirm payment
```

## Expected Result

```text
Payment order created
Status = WAITING_USDT
Settlement wallet displayed
Required USDT displayed
```

## Priority

```text
High
```

---

# TC-PAY-002

## Scenario

Payment expires without USDT received.

## Preconditions

```text
Payment order created
No USDT received
```

## Steps

```text
1. Wait until order expiration
```

## Expected Result

```text
Payment status = EXPIRED
No payout created
```

## Priority

```text
High
```

---

# TC-PAY-003

## Scenario

Payment already completed cannot be processed again.

## Preconditions

```text
Payment status = SUCCESS
```

## Steps

```text
1. Trigger processing again
```

## Expected Result

```text
System rejects duplicate processing
No duplicate payout created
```

## Priority

```text
Critical
```

---

# 7. Blockchain Test Cases

---

# TC-BC-001

## Scenario

Correct USDT payment detected.

## Preconditions

```text
Payment order status = WAITING_USDT
Required amount = 19.43 USDT
Incoming tx amount = 19.43 USDT
Network = TRON
Token = USDT
```

## Expected Result

```text
Blockchain transaction recorded
Payment status = USDT_CONFIRMED
Payout job created
```

## Priority

```text
Critical
```

---

# TC-BC-002

## Scenario

Underpaid USDT.

## Preconditions

```text
Required amount = 19.43 USDT
Incoming amount = 18.00 USDT
```

## Expected Result

```text
Payment status = UNDERPAID
No payout created
Transaction moved to Manual Review
```

## Priority

```text
Critical
```

---

# TC-BC-003

## Scenario

Overpaid USDT.

## Preconditions

```text
Required amount = 19.43 USDT
Incoming amount = 25.00 USDT
```

## Expected Result

```text
Payment status = OVERPAID
No automatic payout for extra amount
Transaction moved to Manual Review
```

## Priority

```text
Critical
```

---

# TC-BC-004

## Scenario

Duplicate blockchain transaction detected.

## Preconditions

```text
tx_hash already exists
```

## Expected Result

```text
Duplicate transaction ignored
No duplicate payout created
```

## Priority

```text
Critical
```

---

# TC-BC-005

## Scenario

USDT received after payment expiration.

## Preconditions

```text
Payment status = EXPIRED
Incoming USDT detected
```

## Expected Result

```text
Transaction moved to Manual Review
No automatic payout
```

## Priority

```text
High
```

---

# TC-BC-006

## Scenario

Wrong token received.

## Preconditions

```text
Expected token = USDT
Received token = USDC
```

## Expected Result

```text
Transaction rejected or flagged
No payout created
Manual Review required
```

## Priority

```text
High
```

---

# 8. Payout Test Cases

---

# TC-PO-001

## Scenario

Payout succeeds.

## Preconditions

```text
Payment status = USDT_CONFIRMED
BaoKim balance sufficient
Valid merchant bank account
```

## Steps

```text
1. Payout worker creates payout request
2. Provider returns success
```

## Expected Result

```text
Payout status = PAYOUT_SUCCESS
Final status = SUCCESS
User sees Payment Successful
```

## Priority

```text
Critical
```

---

# TC-PO-002

## Scenario

Payout fails due to provider error.

## Expected Result

```text
Payout status = PAYOUT_FAILED
Retry scheduled
User sees Under Review or Processing
```

## Priority

```text
High
```

---

# TC-PO-003

## Scenario

Payout fails after maximum retries.

## Preconditions

```text
Retry count = 3
Provider still fails
```

## Expected Result

```text
Transaction moved to Manual Review
No further automatic retry
```

## Priority

```text
High
```

---

# TC-PO-004

## Scenario

BaoKim balance insufficient.

## Expected Result

```text
Payout not submitted
PAYOUT_INSUFFICIENT_BALANCE error logged
Operator alert created
Transaction moved to Manual Review
```

## Priority

```text
Critical
```

---

# TC-PO-005

## Scenario

Duplicate payout callback received.

## Preconditions

```text
Payout already marked as PAYOUT_SUCCESS
```

## Expected Result

```text
Duplicate callback ignored
Final status remains SUCCESS
No duplicate money movement
```

## Priority

```text
Critical
```

---

# 9. Transaction History Test Cases

---

# TC-TXN-001

## Scenario

User views transaction history.

## Preconditions

```text
User has previous transactions
```

## Expected Result

```text
Transaction list displayed
Each item shows merchant, amount, status, date
```

## Priority

```text
Medium
```

---

# TC-TXN-002

## Scenario

User views transaction detail.

## Expected Result

```text
Transaction detail displayed
Includes merchant, amount, status, fee, blockchain, payout information
```

## Priority

```text
Medium
```

---

# 10. Reconciliation Test Cases

---

# TC-REC-001

## Scenario

Blockchain record matches database.

## Expected Result

```text
Reconciliation result = PASS
```

## Priority

```text
High
```

---

# TC-REC-002

## Scenario

Blockchain transaction exists but missing in database.

## Expected Result

```text
Mismatch detected
Manual Review item created
Alert generated
```

## Priority

```text
Critical
```

---

# TC-REC-003

## Scenario

Provider payout success but database still processing.

## Expected Result

```text
Mismatch detected
System updates status or creates review item
```

## Priority

```text
Critical
```

---

# 11. Admin / Operator Test Cases

---

# TC-ADM-001

## Scenario

Admin views transaction list.

## Expected Result

```text
Admin can view all transactions
```

## Priority

```text
Medium
```

---

# TC-ADM-002

## Scenario

Operator retries failed payout.

## Preconditions

```text
Payout status = PAYOUT_FAILED
```

## Expected Result

```text
Retry job created
Audit log recorded
```

## Priority

```text
High
```

---

# TC-ADM-003

## Scenario

Admin suspends user.

## Expected Result

```text
User status = SUSPENDED
User cannot login
Audit log recorded
```

## Priority

```text
Medium
```

---

# 12. Security Test Cases

---

# TC-SEC-001

## Scenario

Unauthorized user calls protected API.

## Expected Result

```text
HTTP 401
No data returned
```

## Priority

```text
High
```

---

# TC-SEC-002

## Scenario

User enters wrong PIN multiple times.

## Expected Result

```text
PIN attempts limited
Temporary lock applied
```

## Priority

```text
High
```

---

# TC-SEC-003

## Scenario

User attempts to access another user's transaction.

## Expected Result

```text
HTTP 403
Access denied
```

## Priority

```text
Critical
```

---

# 13. MVP Critical Test Cases

The following test cases must pass before MVP release:

```text
TC-PAY-001
TC-PAY-002
TC-PAY-003
TC-BC-001
TC-BC-002
TC-BC-003
TC-BC-004
TC-PO-001
TC-PO-004
TC-PO-005
TC-REC-002
TC-REC-003
TC-SEC-003
```

---

# 14. Test Case Summary

## Total Core Test Cases

```text
Authentication: 4
QR: 4
Quote: 4
Payment: 3
Blockchain: 6
Payout: 5
Transaction: 2
Reconciliation: 3
Admin: 3
Security: 3
```

---

## Core Testing Focus

```text
No duplicate payout
No wrong payout amount
No payout without valid USDT
No payment marked success without payout success
No unauthorized access to transaction data
```
