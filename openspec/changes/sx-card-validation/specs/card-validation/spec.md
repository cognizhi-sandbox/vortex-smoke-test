# Card Validation Specification

**Version**: 1.0  
**Status**: EXTRACTED (SX-0003)  
**Date**: 2026-09-03  
**Source**: Legacy petstore CreditCardValidator.java  
**Confidence**: HIGH  
**Risk Class**: FINANCIAL

---

## ADDED Requirements

### Requirement: R1: Null/Empty Card Rejection

A credit card number that is null or empty SHALL be immediately rejected and not accepted for payment processing.

#### Scenario: Null card number rejected

**Given** a null card number  
**When** card validation is invoked  
**Then** the card SHALL be rejected

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 5-6

**Logic**:

```
IF number == null OR number.length() == 0 THEN
  RETURN false (REJECTED)
END IF
```

#### Scenario: Empty card number rejected

**Given** an empty string card number  
**When** card validation is invoked  
**Then** the card SHALL be rejected

### Requirement: R2: Minimum Length Validation

A credit card number SHALL be rejected if it contains fewer than 13 digits.

#### Scenario: Card too short rejected

**Given** a card number with 12 digits  
**When** card validation is invoked  
**Then** the card SHALL be rejected

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, line 6

**Logic**:

```
IF number.length() < 13 THEN
  RETURN false (REJECTED)
END IF
```

#### Scenario: Card meets minimum length accepted

**Given** a card number with 13 digits  
**When** card validation proceeds to brand check  
**Then** the validation continues to next stage

### Requirement: R3: Brand Acceptance

Only credit cards with first digit 4 (Visa) or 5 (Mastercard) SHALL be accepted. All other brands, including American Express (3) and Discover (6), SHALL be rejected.

#### Scenario: Visa card accepted

**Given** a card number starting with 4  
**When** card validation is invoked  
**Then** the card SHALL be accepted

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 7-9

**Logic**:

```
firstDigit = number.charAt(0)
IF firstDigit == '4' THEN
  RETURN true (ACCEPTED, Visa)
ELSE IF firstDigit == '5' THEN
  RETURN true (ACCEPTED, Mastercard)
ELSE
  RETURN false (REJECTED, all other brands)
END IF
```

#### Scenario: Mastercard accepted

**Given** a card number starting with 5  
**When** card validation is invoked  
**Then** the card SHALL be accepted

#### Scenario: American Express rejected

**Given** a card number starting with 3  
**When** card validation is invoked  
**Then** the card SHALL be rejected

---

## Test Cases

| Input              | Length | Brand    | Expected | Notes                 |
| ------------------ | ------ | -------- | -------- | --------------------- |
| null               | 0      | N/A      | REJECTED | Null check            |
| ""                 | 0      | N/A      | REJECTED | Empty check           |
| "401234567890"     | 12     | Visa     | REJECTED | Too short             |
| "4012345678901"    | 13     | Visa     | ACCEPTED | Min length Visa       |
| "5105105105105100" | 16     | MC       | ACCEPTED | Standard Mastercard   |
| "378282246310005"  | 15     | Amex     | REJECTED | Amex dropped 2003     |
| "6011111111111117" | 16     | Discover | REJECTED | Discover not accepted |

---

## Key Decisions

- **Three-stage pipeline**: Null check → Length check → Brand check (order matters)
- **Brand detection**: First digit only (4=Visa, 5=Mastercard, reject all others)
- **Minimum length**: 13 digits (conservative; standard cards are 16)
- **No Luhn validation**: Signature/checksum not validated
- **Amex dropped 2003**: Reason undocumented; Discover also rejected

---

## Source Traceability

**Legacy Source** (`legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 5-9):

```java
public boolean isValidCardNumber(String number) {
  if (number == null || number.length() == 0) return false;
  if (number.length() < 13) return false;
  char firstDigit = number.charAt(0);
  return firstDigit == '4' || firstDigit == '5';
}
```

**Extracted Records**:

- `CARD-VALIDATION-NULL-CHECK-0001`: Null/empty rejection
- `CARD-VALIDATION-LENGTH-REQUIREMENT-0001`: 13-digit minimum
- `CARD-VALIDATION-BRAND-VISA-MASTERCARD-0001`: Brand acceptance

**Confidence**: HIGH (both passes agreed 100%; logic explicit in code)  
**Extraction**: SX-0003 two-pass specification extraction (2026-09-03)

---

**END OF SPECIFICATION**
