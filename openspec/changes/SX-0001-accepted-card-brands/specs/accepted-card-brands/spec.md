# Specification: Accepted Card Brands

**Capability:** `accepted-card-brands`  
**Module:** billing · payment card validation  
**Change ID:** SX-0001-accepted-card-brands  
**Version:** 1.0  
**Status:** PROPOSED  
**Effective Date:** (on merge)

---

## 1. Scope

This specification defines the rules for determining whether a payment card is accepted by the petstore system, based on its brand (Visa, Mastercard) and conformance to card number standards.

The specification covers:

- Card brand identification and acceptance
- Card number length validation (minimum and maximum)
- Checksum validation (Luhn algorithm)
- Error handling and rejection reasons

Out of scope:

- Card expiration validation (covered by separate spec)
- Refund eligibility (covered by separate spec)
- 3D Secure authentication or fraud detection
- Tokenization or PCI compliance mechanisms

---

## 2. Card Brand Acceptance Rules

### 2.1 Visa Brand

**Requirement:** A card is identified as Visa if the first digit of the card number is `4`.

**Specification:**

- Check: `cardNumber[0] == '4'`
- Accepted: YES
- Notes: Visa cards are always accepted, subject to length constraints (§3) and checksum validation (§4)

**Examples:**

- `4111111111111111` → Visa ✓
- `4532015112830366` → Visa ✓

---

### 2.2 Mastercard Brand

**Requirement:** A card is identified as Mastercard if its IIN (Issuer Identification Number) falls within one of the following ranges:

| Range     | Type             | Notes                            |
| --------- | ---------------- | -------------------------------- |
| 51-55     | Legacy BIN range | 2-digit BIN, issued before 2016  |
| 2221-2720 | Modern BIN range | 4-digit BIN, issued 2016 onwards |

**Specification:**

- Extract first 4 digits of card number as integer
- If (first digit == '5' AND second digit in 1-5): **ACCEPTED** (matches 51-55 range)
- If (first 4 digits >= 2221 AND first 4 digits <= 2720): **ACCEPTED** (matches 2221-2720 range)
- All other '5' cards: **REJECTED** (outside defined ranges)

**Accepted:** YES (only for defined BIN ranges)

**Notes:**

- Legacy range 51-55 is 2-digit matching: only 5100-5599
- Modern range 2221-2720 is 4-digit matching: 2221-2720
- Cards starting with '56', '57', '58', '59' are **rejected** (outside both ranges)

**Examples:**

- `5100000000000000` → Mastercard (BIN 5100 in 51-55) ✓
- `5555555555554444` → Mastercard (BIN 5555 in 51-55) ✓
- `2221000000000000` → Mastercard (BIN 2221 in 2221-2720) ✓
- `5600000000000000` → **REJECTED** (BIN 5600 not in ranges) ✗
- `5999999999999999` → **REJECTED** (BIN 5999 not in ranges) ✗

---

### 2.3 Other Card Brands

**Requirement:** All card brands other than Visa and Mastercard are **NOT ACCEPTED**.

**Accepted:** NO

**Examples of Rejected Brands:**

- American Express (prefix 34, 37)
- Discover (prefix 6011, 622126-622925)
- Diners Club (prefix 300-305, 36, 38)
- JCB (prefix 3528-3589)

**Notes:** This is a deliberate restriction. Re-enabling support for additional brands requires a specification change and implementation update.

---

## 3. Card Number Length Validation

### 3.1 Minimum Length

**Requirement:** A card number must be at least 13 characters in length.

**Specification:**

- Check: `cardNumber.length() >= 13`
- Validation Point: Before brand identification
- Action on Failure: **REJECT** with reason "Card number too short"

**Rationale:** 13 characters is the minimum across all major payment networks.

---

### 3.2 Maximum Length

**Requirement:** A card number must not exceed 19 characters in length.

**Specification:**

- Check: `cardNumber.length() <= 19`
- Validation Point: Before brand identification
- Action on Failure: **REJECT** with reason "Card number too long"

**Rationale:** 19 characters accommodates all standard card lengths with margin for expansion:

- Visa: typically 16 digits
- Mastercard: typically 16 digits
- American Express (if re-enabled): 15 digits
- Margin: +3 digits for future standards

**Examples:**

- `4111111111111` (13 digits) → **ACCEPT** ✓
- `41111111111111` (14 digits) → **ACCEPT** ✓
- `4111111111111111` (16 digits) → **ACCEPT** ✓
- `41111111111111111` (17 digits) → **ACCEPT** ✓
- `411111111111111111` (18 digits) → **ACCEPT** ✓
- `4111111111111111111` (19 digits) → **ACCEPT** ✓
- `41111111111111111111` (20 digits) → **REJECT** ✗

---

## 4. Checksum Validation (Luhn Algorithm)

### 4.1 Requirement

A card number must satisfy the Luhn algorithm checksum as defined in ISO/IEC 7812-1.

**Specification:**

1. Double every second digit from right to left
2. If doubling result > 9, subtract 9
3. Sum all resulting digits
4. Checksum is valid if (sum mod 10) == 0

**Validation Point:** After brand and length validation  
**Action on Failure:** **REJECT** with reason "Invalid card number (checksum)"

---

### 4.2 Luhn Algorithm Implementation

```
Function: luhnChecksum(cardNumber: String) -> Boolean
  sum = 0
  shouldDouble = false

  for digit in cardNumber (right to left):
    d = parseInt(digit)

    if shouldDouble:
      d = d * 2
      if d > 9:
        d = d - 9

    sum += d
    shouldDouble = !shouldDouble

  return (sum % 10) == 0
```

**Test Vectors:**

- `4532015112830366` → checksum valid ✓
- `4532015112830367` → checksum invalid ✗
- `5500000000000004` → checksum valid ✓
- `5500000000000005` → checksum invalid ✗

---

### 4.3 Implementation Responsibility

**TBD: To be confirmed by SME review (Task 1.2)**

**Option A: Implemented in `CreditCardValidator` module**

- Location: `billing/CreditCardValidator.java`
- Method: Add `luhnChecksum(String number): boolean`
- Invoked by: `isAcceptedBrand()` method
- Responsibility: Billing team
- Benefit: Complete validation in one place

**Option B: Delegated to Payment Gateway**

- Location: Payment gateway API (conf/integration.properties endpoint)
- Method: Gateway validates checksum on submission
- Responsibility: Payment Platform team
- Benefit: Leverages gateway's existing validation

**Option C: Delegated to Calling Code**

- Location: Orders module or payment processing flow
- Method: Caller validates before calling `CreditCardValidator`
- Responsibility: Orders/payment processing team
- Benefit: Separation of concerns

**Current Status:** Implementation responsibility TBD by SME decision.

---

## 5. Validation Sequence

All validations SHALL be performed in the following order (fail-fast):

1. **Null Check:** `cardNumber == null` → **REJECT** ("Card number cannot be null")
2. **Minimum Length:** `cardNumber.length() < 13` → **REJECT** ("Card number too short")
3. **Maximum Length:** `cardNumber.length() > 19` → **REJECT** ("Card number too long")
4. **Brand Check:** Validate brand per §2 → **REJECT** if not Visa or Mastercard ("Brand not accepted")
5. **Checksum:** Validate Luhn per §4 → **REJECT** if invalid ("Invalid card number")

**Result:** **ACCEPT** only if all 5 checks pass

---

## 6. Return Values & Error Messages

### 6.1 Return Values

```java
public boolean isAcceptedBrand(String cardNumber)
  returns: true if card passes all validations
  returns: false if card fails any validation
```

### 6.2 Error Messages

Each rejection reason SHALL be logged for analytics:

| Rejection Reason               | Code                 | Severity |
| ------------------------------ | -------------------- | -------- |
| Card number cannot be null     | NULL_CARD            | ERROR    |
| Card number too short          | MIN_LENGTH_VIOLATION | WARN     |
| Card number too long           | MAX_LENGTH_VIOLATION | WARN     |
| Brand not accepted             | UNSUPPORTED_BRAND    | WARN     |
| Invalid card number (checksum) | LUHN_CHECKSUM_FAILED | WARN     |

---

## 7. Backwards Compatibility

### 7.1 Breaking Changes

The following cards will be **rejected** by this specification but were **accepted** by legacy code:

- Any card starting with '5' with BIN outside ranges 51-55 and 2221-2720
  - Example: `5600000000000000` (legacy ACCEPTED, new REJECTED)
- Cards with length > 19 characters (if any exist)
  - Example: `45555555555555555555` (legacy ACCEPTED, new REJECTED)
- Cards with invalid Luhn checksum (if checksum is implemented here)
  - Example: `4532015112830367` (legacy ACCEPTED, new REJECTED)

### 7.2 Non-Breaking Changes

The following cards will continue to behave as before:

- All Visa cards (prefix '4') — unchanged
- Mastercard cards with BIN in 51-55 range — unchanged
- Mastercard cards with BIN in 2221-2720 range — NEW ACCEPTANCE
- All rejections for non-Visa/non-Mastercard brands — unchanged

### 7.3 Migration Path

To minimize disruption:

1. **Feature Flag:** Implement changes behind a feature flag (`CARD_VALIDATION_V2_ENABLED`)
2. **Gradual Rollout:** Enable for 5% → 25% → 75% → 100% of requests
3. **Logging:** Log all rejections with card BIN (masked) and reason
4. **Monitoring:** Track rejection rates per brand/BIN for impact assessment
5. **Rollback:** Disable feature flag if unexpected rejections exceed threshold (>0.5%)

---

## 8. Test Cases

### 8.1 Visa Cards (Should ACCEPT)

| Card Number          | Length | BIN | Expected Result     |
| -------------------- | ------ | --- | ------------------- |
| 4111111111111111     | 16     | 4   | ACCEPT              |
| 4532015112830366     | 16     | 4   | ACCEPT              |
| 4539111111111111     | 16     | 4   | ACCEPT              |
| 411111111111         | 12     | 4   | REJECT (min length) |
| 41111111111111111111 | 20     | 4   | REJECT (max length) |

### 8.2 Mastercard Cards — Legacy Range (Should ACCEPT)

| Card Number      | Length | BIN  | Expected Result |
| ---------------- | ------ | ---- | --------------- |
| 5100000000000000 | 16     | 5100 | ACCEPT          |
| 5555555555554444 | 16     | 5555 | ACCEPT          |
| 5105105105105100 | 16     | 5105 | ACCEPT          |

### 8.3 Mastercard Cards — Modern Range (Should ACCEPT)

| Card Number      | Length | BIN  | Expected Result |
| ---------------- | ------ | ---- | --------------- |
| 2221000000000000 | 16     | 2221 | ACCEPT          |
| 2720999999999999 | 16     | 2720 | ACCEPT          |

### 8.4 Rejected '5' Cards (Outside Ranges, Should REJECT)

| Card Number      | Length | BIN  | Expected Result |
| ---------------- | ------ | ---- | --------------- |
| 5600000000000000 | 16     | 5600 | REJECT          |
| 5999999999999999 | 16     | 5999 | REJECT          |
| 5000000000000000 | 16     | 5000 | REJECT          |

### 8.5 Other Brands (Should REJECT)

| Card Number      | Brand    | Expected Result |
| ---------------- | -------- | --------------- |
| 374245455400126  | Amex     | REJECT          |
| 6011111111111117 | Discover | REJECT          |
| 3530111333300000 | JCB      | REJECT          |
| 300000000000005  | Diners   | REJECT          |

### 8.6 Edge Cases

| Card Number           | Issue      | Expected Result                        |
| --------------------- | ---------- | -------------------------------------- |
| null                  | Null       | REJECT                                 |
| ""                    | Empty      | REJECT                                 |
| " "                   | Whitespace | REJECT (unless trimmed upstream)       |
| "4111-1111-1111-1111" | Hyphens    | REJECT (unless parsing handles dashes) |

---

## 9. Related Specifications

- **Card Expiration Validation** (separate spec): Validates expiry date
- **Refund Eligibility** (separate spec): 90-day refund window
- **Payment Gateway Integration** (conf/integration.properties): External validation

---

## 10. References

- ISO/IEC 7812-1: Identification cards — Numbering system and registration procedure (Luhn algorithm)
- Visa Merchant Acquiring Regulations v3.2
- Mastercard Card Range Information (BIN tables)

---

## 11. Version History

| Version | Date            | Author            | Change                              |
| ------- | --------------- | ----------------- | ----------------------------------- |
| 0.1     | 2024-09-03      | SX-0001 Extractor | Initial extraction from legacy code |
| 1.0     | (pending merge) | Architecture      | Formalized specification            |

---

## 12. Approval & Sign-Off

- [ ] Payment Security Team approval
- [ ] Billing Team lead approval
- [ ] Integration team sign-off on impact assessment
- [ ] Product management approval of breaking changes
