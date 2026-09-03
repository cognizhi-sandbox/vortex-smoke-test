# Card Acceptance Specification

## Overview

The card acceptance capability defines which credit cards the system accepts for payment processing, validates card properties, and establishes eligibility rules.

**Extracted from:** Pet Store Legacy Application (legacy-source/modules/billing/)  
**Confidence:** High (3 rules, 2 ambiguities requiring review)  
**Risk Class:** Financial (PCI DSS compliance, fraud risk, refund liability)

## ADDED Requirements

### Card Brand Acceptance

The system SHALL accept only Visa and Mastercard credit cards. Cards with leading digit 4 (Visa) or 5 (Mastercard) SHALL be accepted; all other brands SHALL be rejected.

**Trace:** `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java:5-9`

**Confidence:** High

**Rationale:** PCI DSS compliance requires card brand validation. The legacy system explicitly supports only Visa and Mastercard, rejecting all others including Amex (dropped 2003).

#### Scenario: Visa card is accepted

- GIVEN a card number starting with digit 4
- WHEN card validation is performed
- THEN the card SHALL be accepted as valid

#### Scenario: Mastercard is accepted

- GIVEN a card number starting with digit 5
- WHEN card validation is performed
- THEN the card SHALL be accepted as valid

#### Scenario: American Express is rejected

- GIVEN a card number starting with digit 3
- WHEN card validation is performed
- THEN the card SHALL be rejected

#### Scenario: Invalid brand digit is rejected

- GIVEN a card number starting with digit 6, 7, 8, or 9
- WHEN card validation is performed
- THEN the card SHALL be rejected

#### Scenario: Null card is rejected

- GIVEN a null card number
- WHEN card validation is performed
- THEN the card SHALL be rejected

---

### Minimum Card Length

The system SHALL reject credit card numbers with fewer than 13 digits.

**Trace:** `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java:6`

**Confidence:** Low (undocumented threshold)

**Rationale:** Industry standard ISO/IEC 7812 specifies card numbers between 12 and 19 digits. The choice of 13 as a minimum is not justified in the legacy code.

#### Scenario: 12-digit card is rejected

- GIVEN a valid Visa card number with 12 digits
- WHEN card validation is performed
- THEN the card SHALL be rejected for being too short

#### Scenario: 13-digit card is accepted

- GIVEN a valid Visa card number with 13 digits
- WHEN card validation is performed
- THEN the card SHALL be accepted (if other validations pass)

#### Scenario: Empty string is rejected

- GIVEN an empty string as card number
- WHEN card validation is performed
- THEN the card SHALL be rejected

#### Scenario: Very short number is rejected

- GIVEN a card number with 1-5 digits
- WHEN card validation is performed
- THEN the card SHALL be rejected

---

### Card Expiry Validation

The system SHALL detect expired credit cards based on expiry year and month. A card is expired if the expiry year is before the current year, or if the expiry year equals the current year AND the expiry month is before the current month.

**Trace:** `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java:12-14`

**Confidence:** High

**Rationale:** Standard credit card expiry logic. Cards are valid through the last day of the expiry month.

#### Scenario: Card expired in prior year is rejected

- GIVEN a card with expiry year 2024 and current year is 2026
- WHEN card validation is performed
- THEN the card SHALL be marked as expired

#### Scenario: Card expired in prior month of current year is rejected

- GIVEN a card with expiry month 06/2026 and current date is 08/2026
- WHEN card validation is performed
- THEN the card SHALL be marked as expired

#### Scenario: Card expiring in current month is valid

- GIVEN a card with expiry month 08/2026 and current date is 08/2026
- WHEN card validation is performed
- THEN the card SHALL be marked as valid

#### Scenario: Card expiring in future month is valid

- GIVEN a card with expiry month 12/2026 and current date is 08/2026
- WHEN card validation is performed
- THEN the card SHALL be marked as valid

#### Scenario: Card expiring in future year is valid

- GIVEN a card with expiry year 2027 and current year is 2026
- WHEN card validation is performed
- THEN the card SHALL be marked as valid

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
