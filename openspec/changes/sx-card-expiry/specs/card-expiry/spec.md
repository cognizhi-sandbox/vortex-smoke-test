# Card Expiry Validation Specification

**Version**: 1.0  
**Status**: EXTRACTED (SX-0003)  
**Date**: 2026-09-03  
**Source**: Legacy petstore billing system (CreditCardValidator.java)  
**Confidence**: HIGH  
**Risk Class**: FINANCIAL

---

## ADDED Requirements

### Requirement: R1: Year Expiry Check

A payment card SHALL be considered expired if its expiry year is earlier than the current year.

#### Scenario: Card expired in past year

**Given** a payment card with expiry year 2025  
**When** the current year is 2026  
**Then** the card SHALL be considered expired

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, line 13

**Logic**:

```
IF expiryYear < currentYear THEN card is EXPIRED
```

### Requirement: R2: Month Expiry Check (Same Year)

A payment card with an expiry year equal to the current year SHALL be considered expired if its expiry month is earlier than the current month.

#### Scenario: Card expired in past month (same year)

**Given** a payment card with expiry date August 2026  
**When** the current date is September 2026  
**Then** the card SHALL be considered expired

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, line 14

**Logic**:

```
IF expiryYear == currentYear AND expiryMonth < currentMonth THEN card is EXPIRED
```

### Requirement: R3: Current Month Validity

A payment card expiring in the current month SHALL be considered valid (not expired) for the entire month.

#### Scenario: Card expires in current month remains valid

**Given** a payment card with expiry date September 2026  
**When** the current date is any day in September 2026  
**Then** the card SHALL NOT be considered expired

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, line 14

**Logic**:

```
IF expiryYear == currentYear AND expiryMonth == currentMonth THEN card is VALID
```

**Rationale**: Payment card industry standard allows transactions through the end of the stated expiry month.

### Requirement: R4: Future Validity

A payment card expiring in a month after the current month SHALL be considered valid.

#### Scenario: Card expires in future month

**Given** a payment card with expiry date December 2026  
**When** the current date is September 2026  
**Then** the card SHALL be considered valid

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 13-14

**Logic**:

```
IF expiryYear == currentYear AND expiryMonth > currentMonth THEN card is VALID
OR IF expiryYear > currentYear THEN card is VALID
```

#### Scenario: Card expires in future year

**Given** a payment card with expiry date January 2027  
**When** the current date is December 2026  
**Then** the card SHALL be considered valid

---

## Test Cases

| Scenario      | expiryYear | expiryMonth | currentYear | currentMonth | Result  | Notes                      |
| ------------- | ---------- | ----------- | ----------- | ------------ | ------- | -------------------------- |
| Year expired  | 2025       | 12          | 2026        | 6            | EXPIRED | Past year                  |
| Month expired | 2026       | 6           | 2026        | 9            | EXPIRED | Past month (same year)     |
| Current month | 2026       | 9           | 2026        | 9            | VALID   | Valid through entire month |
| Future month  | 2026       | 12          | 2026        | 9            | VALID   | Future month (same year)   |
| Future year   | 2027       | 1           | 2026        | 12           | VALID   | Future year (any month)    |

---

## Key Decisions

- **Order of Checks**: Year check first (optimization), then month check if years match
- **Current Month Validity**: Cards are valid through the entire expiry month (industry standard)
- **No Timezone Handling**: System should establish UTC vs local time convention separately
- **Month-Level Granularity**: Day-of-month not considered; comparisons use integer month values only

---

## Source Traceability

**Legacy Source** (`legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 12-14):

```java
public boolean isExpired(int expiryYear, int expiryMonth, int nowYear, int nowMonth) {
  if (expiryYear < nowYear) return true;
  return expiryYear == nowYear && expiryMonth < nowMonth;
}
```

**Extracted Records**:

- `CARD-EXPIRY-YEAR-MONTH-COMPARISON-0001`: Core expiry logic
- `CARD-EXPIRY-CURRENT-MONTH-VALIDITY-0001`: Current month edge case

**Confidence**: HIGH (both passes agree; logic explicit in code)  
**Extraction Date**: 2026-09-03  
**Process**: SX-0003 two-pass specification extraction

---

**END OF SPECIFICATION**
