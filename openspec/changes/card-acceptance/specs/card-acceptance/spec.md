# Card Acceptance Specification

## Overview

The card acceptance capability defines which credit cards the system accepts for payment processing, validates card properties, and establishes eligibility rules.

**Extracted from:** Pet Store Legacy Application (legacy-source/modules/billing/)  
**Confidence:** High (3 rules, 2 ambiguities requiring review)  
**Risk Class:** Financial (PCI DSS compliance, fraud risk, refund liability)

## Rules

### Rule 1: Card Brand Acceptance

**Requirement:** The system SHALL accept only Visa and Mastercard credit cards. Cards with leading digit 4 (Visa) or 5 (Mastercard) SHALL be accepted; all other brands SHALL be rejected.

**Confidence:** High

**Trace:** `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java:5-9`

**Implementation:**

```java
public boolean isAcceptedBrand(String number) {
    if (number == null || number.length() < 13) return false;
    char first = number.charAt(0);
    // Visa (4) and Mastercard (5) only; Amex was dropped in 2003.
    return first == '4' || first == '5';
}
```

**Rationale:** PCI DSS compliance requires card brand validation. The legacy system explicitly supports only Visa and Mastercard, rejecting all others including Amex (dropped 2003).

**Edge Cases:**

- Null card number → Rejected
- Empty string → Rejected
- Card number too short (< 13 digits) → Rejected before brand check

---

### Rule 2: Minimum Card Length

**Requirement:** The system SHALL reject credit card numbers with fewer than 13 digits. GIVEN a card number with length < 13, WHEN validation is performed, THEN the card SHALL be rejected.

**Confidence:** Low (undocumented threshold)

**Trace:** `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java:6`

**Implementation:**

```java
if (number == null || number.length() < 13) return false;
```

**Rationale:** Industry standard ISO/IEC 7812 specifies card numbers between 12 and 19 digits. The choice of 13 as a minimum is not justified in the legacy code. **This threshold requires SME review.**

**Ambiguity:** Is the 13-digit minimum intentional (e.g., rejecting legacy 12-digit cards) or arbitrary? No documentation provided.

---

### Rule 3: Card Expiry Validation

**Requirement:** The system SHALL detect expired credit cards based on expiry year and month. A card is expired if the expiry year is before the current year, or if the expiry year equals the current year AND the expiry month is before the current month.

**Confidence:** High

**Trace:** `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java:12-14`

**Implementation:**

```java
public boolean isExpired(int expiryYear, int expiryMonth, int nowYear, int nowMonth) {
    if (expiryYear < nowYear) return true;
    return expiryYear == nowYear && expiryMonth < nowMonth;
}
```

**Rationale:** Standard credit card expiry logic. Cards are valid through the last day of the expiry month.

**Boundary Condition:** Cards expiring in the current month ARE valid.

**Edge Cases:**

- Expiry year < current year → Expired
- Expiry year = current year AND expiry month < current month → Expired
- Expiry year = current year AND expiry month = current month → NOT expired (valid)
- Expiry year > current year → NOT expired (valid)

**Implicit Assumptions:**

- Expiry month is 1-12 (calendar month)
- Current date is provided as integer year and month (not timestamp)
- No time-of-day consideration (valid through end of month)

---

## Summary Table

| Rule                                            | Status    | Confidence | Notes                                                 |
| ----------------------------------------------- | --------- | ---------- | ----------------------------------------------------- |
| Brand acceptance (Visa/Mastercard only)         | Extracted | High       | Needs business justification for why Amex was dropped |
| Minimum 13 digits                               | Extracted | Low        | Threshold undocumented; needs SME review              |
| Expiry validation (year-first, month-inclusive) | Extracted | High       | Standard payment industry logic                       |

## Related Capabilities

- **refund-policy:** Refund eligibility (90-day post-settlement window) is separate from card acceptance
- **order-approval:** Card acceptance is independent of order approval thresholds

## Regulatory Context

- **PCI DSS:** Card brand restrictions and validation are PCI compliance requirements
- **SOX:** Card acceptance rules fall under internal controls for financial transactions
- **Liability:** Refund eligibility and card acceptance directly affect fraud liability and dispute handling

## Open Items for SME Review

1. **13-Digit Minimum:** Confirm business justification or adjust threshold
2. **Amex History:** Document why Amex was dropped in 2003 (contract, fraud, market, regulatory)
3. **Future Brands:** Should Discover, Diners, JCB, or other cards be considered? (Currently not in spec)
4. **Luhn Validation:** Should full Luhn checksum validation be performed? (Currently not in spec)
5. **Card BIN Database:** Should card brand detection use BIN lookup instead of first digit heuristic? (Currently uses digit)
