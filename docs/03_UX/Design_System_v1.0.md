# MistyPay - Design System Document

> Version: 1.0
> Status: Draft - MVP Phase
> Product: MistyPay
> Product Owner: Le Vu Bao Nhat
> Last Updated: 2026

---

# 1. Document Purpose

This document defines the visual design system for MistyPay MVP.

Objectives:

- Standardize UI design
- Maintain consistent branding
- Support React Native development
- Support AI-assisted UI generation
- Improve user trust and clarity

---

# 2. Brand Direction

## Product Name

```text
MistyPay
```

## Brand Personality

```text
Simple
Trustworthy
Fast
Clean
Travel-friendly
```

## Core Message

```text
Pay Like A Local
```

## Design Principle

MistyPay should feel like:

```text
Travel Fintech
```

not:

```text
Crypto Exchange
```

---

# 3. Color Palette

## Primary Color

```text
Misty Blue
```

```css
#2563EB
```

Usage:

```text
Primary buttons
Active states
Important highlights
Links
```

---

## Primary Light

```css
#DBEAFE
```

Usage:

```text
Soft background
Info cards
Selected states
```

---

## Background

```css
#F8FAFC
```

Usage:

```text
Main app background
Screen background
```

---

## Surface

```css
#FFFFFF
```

Usage:

```text
Cards
Inputs
Modals
Bottom sheets
```

---

## Text Primary

```css
#0F172A
```

Usage:

```text
Main text
Titles
Important numbers
```

---

## Text Secondary

```css
#64748B
```

Usage:

```text
Descriptions
Labels
Subtitles
```

---

## Border

```css
#E2E8F0
```

Usage:

```text
Input borders
Card borders
Dividers
```

---

## Success

```css
#22C55E
```

Usage:

```text
Successful payment
Confirmed transaction
Positive status
```

---

## Warning

```css
#F59E0B
```

Usage:

```text
Pending payment
Waiting status
Quote expiration
```

---

## Error

```css
#EF4444
```

Usage:

```text
Failed transaction
Invalid QR
Payout error
```

---

# 4. Color Usage Rules

## Primary Actions

Use:

```css
#2563EB
```

for:

```text
Confirm Payment
Login
Register
Continue
Scan QR
```

---

## Success Screens

Use:

```css
#22C55E
```

for:

```text
Success icon
Success label
Completed state
```

---

## Error Screens

Use:

```css
#EF4444
```

for:

```text
Error icon
Failure message
Invalid input
```

---

## Background Rule

Default screen background:

```css
#F8FAFC
```

Card background:

```css
#FFFFFF
```

---

# 5. Typography

## Font Family

Use system default font.

For iOS:

```text
SF Pro
```

For Android future support:

```text
Roboto
```

---

## Font Scale

### Display / Large Number

Used for:

```text
VND Amount
USDT Amount
Success Amount
```

Style:

```text
Font Size: 32
Font Weight: 700
Line Height: 40
```

---

### Screen Title

Used for:

```text
Home
Scan QR
Payment Confirmation
History
Profile
```

Style:

```text
Font Size: 24
Font Weight: 700
Line Height: 32
```

---

### Section Title

Used for:

```text
Merchant Information
Payment Summary
Recent Transactions
```

Style:

```text
Font Size: 18
Font Weight: 600
Line Height: 26
```

---

### Body Text

Used for:

```text
General descriptions
Normal content
```

Style:

```text
Font Size: 16
Font Weight: 400
Line Height: 24
```

---

### Label Text

Used for:

```text
Input labels
Field labels
Small descriptions
```

Style:

```text
Font Size: 14
Font Weight: 500
Line Height: 20
```

---

### Caption Text

Used for:

```text
Hint text
Timestamp
Helper message
```

Style:

```text
Font Size: 12
Font Weight: 400
Line Height: 16
```

---

# 6. Spacing System

Use 4-point spacing system.

```text
4
8
12
16
20
24
32
40
48
```

---

## Common Spacing

### Screen Padding

```text
16
```

---

### Card Padding

```text
16
```

---

### Section Gap

```text
24
```

---

### Component Gap

```text
12
```

---

# 7. Border Radius

## Small

```text
8
```

Usage:

```text
Small tags
Badges
```

---

## Medium

```text
12
```

Usage:

```text
Inputs
Secondary buttons
```

---

## Large

```text
16
```

Usage:

```text
Cards
Primary buttons
```

---

## Extra Large

```text
24
```

Usage:

```text
Bottom sheets
Large containers
```

---

# 8. Buttons

## Primary Button

Used for:

```text
Confirm Payment
Continue
Login
Register
Scan QR
```

Style:

```text
Background: #2563EB
Text: #FFFFFF
Height: 52
Border Radius: 16
Font Size: 16
Font Weight: 600
```

---

## Secondary Button

Used for:

```text
Cancel
Back
Edit
```

Style:

```text
Background: #DBEAFE
Text: #2563EB
Height: 52
Border Radius: 16
Font Size: 16
Font Weight: 600
```

---

## Danger Button

Used for:

```text
Logout
Cancel Payment
```

Style:

```text
Background: #FEE2E2
Text: #EF4444
Height: 52
Border Radius: 16
Font Size: 16
Font Weight: 600
```

---

## Disabled Button

Style:

```text
Background: #CBD5E1
Text: #64748B
```

---

# 9. Inputs

## Text Input

Used for:

```text
Email
Password
VND Amount
Name
```

Style:

```text
Height: 52
Background: #FFFFFF
Border: #E2E8F0
Border Radius: 12
Padding Horizontal: 16
Font Size: 16
```

---

## Focus State

```text
Border: #2563EB
```

---

## Error State

```text
Border: #EF4444
Helper Text: #EF4444
```

---

## PIN Input

Used for:

```text
Transaction confirmation
Security settings
```

Style:

```text
6 digit boxes
Box size: 48
Border Radius: 12
```

---

# 10. Cards

## Default Card

Used for:

```text
Rate Card
Merchant Card
Transaction Card
Payment Summary Card
```

Style:

```text
Background: #FFFFFF
Border Radius: 16
Padding: 16
Border: #E2E8F0
```

---

## Transaction Card

Content:

```text
Merchant Name
Amount
Status
Date
```

---

## Rate Card

Content:

```text
USDT/VND Rate
Last Updated
```

---

## Payment Summary Card

Content:

```text
Merchant
Bank
VND Amount
USDT Amount
Fee
Total
```

---

# 11. Status Badges

## Success Badge

```text
Background: #DCFCE7
Text: #16A34A
```

Label:

```text
Success
```

---

## Pending Badge

```text
Background: #FEF3C7
Text: #D97706
```

Label:

```text
Pending
```

---

## Failed Badge

```text
Background: #FEE2E2
Text: #DC2626
```

Label:

```text
Failed
```

---

## Review Badge

```text
Background: #E0E7FF
Text: #4F46E5
```

Label:

```text
Review
```

---

# 12. Icons

## Icon Style

Use:

```text
Outline icons
Rounded style
Simple fintech look
```

---

## Recommended Icon Categories

```text
Home
Scan
History
Profile
Success
Warning
Error
Bank
QR
Wallet
Security
```

---

## Icon Size

```text
24
```

for normal icons.

```text
48
```

for success/error illustration icons.

---

# 13. Bottom Navigation

## Tabs

```text
Home
Scan
History
Profile
```

---

## Active Tab

```text
Icon: #2563EB
Text: #2563EB
```

---

## Inactive Tab

```text
Icon: #94A3B8
Text: #94A3B8
```

---

# 14. Screen Layout Rules

## Default Layout

```text
Safe Area
↓
Header
↓
Content
↓
Action Button
```

---

## Payment Screens

Payment screens should prioritize:

```text
Amount
Merchant
Fee
Confirmation
```

---

## Success Screens

Success screens should prioritize:

```text
Success Icon
Amount
Merchant
Transaction ID
Action Buttons
```

---

# 15. Motion & Animation

## Allowed

```text
Fade
Slide
Scale small
Loading spinner
```

---

## Avoid

```text
Crypto-style animations
Particle effects
Heavy transitions
```

---

# 16. Tone of Interface

## Preferred Tone

```text
Clear
Short
Reassuring
Simple
```

---

## Example

Use:

```text
Payment successful
```

Avoid:

```text
Blockchain transaction has been completed successfully
```

---

# 17. UX Copy Rules

## Avoid Technical Terms

Avoid showing:

```text
Gas
Hash
RPC
TRC20 confirmation
```

unless inside transaction detail.

---

## User-Friendly Terms

Use:

```text
Payment
Amount
Fee
Rate
Processing
Completed
```

---

# 18. Example Screen Styling

## Home Screen

```text
Background: #F8FAFC
Header Title: 24 / Bold
Rate Card: White Card
Scan Button: Primary Button
Recent Transactions: Transaction Cards
```

---

## Payment Confirmation Screen

```text
Amount: 32 / Bold
Merchant Card: White Card
Fee Breakdown: Label + Value
Confirm Button: Primary Button
```

---

## Success Screen

```text
Success Icon: Green
Amount: 32 / Bold
Merchant Name: 18 / SemiBold
Back Home Button: Primary Button
View Details Button: Secondary Button
```

---

# 19. Design System Summary

## Main Colors

```text
Primary: #2563EB
Background: #F8FAFC
Surface: #FFFFFF
Text: #0F172A
Success: #22C55E
Error: #EF4444
```

---

## Design Style

```text
Clean fintech
Travel-friendly
Minimal crypto exposure
Blue-white branding
```

---

## Core UI Principle

```text
The user should feel they are making a simple local payment, not operating a blockchain wallet.
```
