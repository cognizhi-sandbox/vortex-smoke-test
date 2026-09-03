# Card Expiry Validation — Design

## Architecture

The card expiry validation logic is a utility function with no side effects. It takes four parameters (expiry year, expiry month, current year, current month) and returns a boolean indicating whether the card is expired.

### Current Legacy Implementation

```java
public boolean isExpired(int expiryYear, int expiryMonth, int nowYear, int nowMonth) {
  if (expiryYear < nowYear) return true;
  return expiryYear == nowYear && expiryMonth < nowMonth;
}
```

### Design Principles

1. **Pure Function** — no state, no side effects. The logic depends only on four numeric inputs.
2. **Defensive** — compare years first (fast path), then months only if years match.
3. **Industry Standard** — uses less-than (<) operators, not less-than-or-equal (<=), which naturally encodes "valid through end of month" semantics.

### Data Contracts

**Input**

- `expiryYear`: Integer year from card (e.g., 2026)
- `expiryMonth`: Integer month from card, 1-12 (e.g., 12 for December)
- `nowYear`: Current year, must be ≥ expiry year for most cases (integer)
- `nowMonth`: Current month, 1-12 (integer)

**Output**

- Boolean: `true` if card is expired, `false` if card is valid

**Invariants**

- All parameters are non-null integers
- Month values are in range 1-12 (validation of this range is out of scope for this logic)
- Year values can be any positive integer (no bounds assumed)

## Behavior Specification

### Decision Tree

```
Input: expiryYear, expiryMonth, nowYear, nowMonth

Step 1: Compare years
  IF expiryYear < nowYear
    THEN card is EXPIRED (return true)
    ELSE proceed to Step 2

Step 2: Check year equality
  IF expiryYear == nowYear
    THEN compare months (Step 3)
    ELSE card is VALID (return false) [expiry year > now year]

Step 3: Compare months (only when years equal)
  IF expiryMonth < nowMonth
    THEN card is EXPIRED (return true)
    ELSE card is VALID (return false) [expiry month >= now month]
```

### Boundary Conditions

**Case 1: Expiry Month in Past (Same Year)**

```
Expiry: 2026-08
Current: 2026-09
Result: EXPIRED (expiryMonth 8 < nowMonth 9)
```

**Case 2: Expiry Month is Current Month (Edge Case)**

```
Expiry: 2026-09
Current: 2026-09
Result: VALID (expiryMonth 9 NOT < nowMonth 9, so false)
Note: Card is valid for entire month of September 2026
```

**Case 3: Expiry Month in Future (Same Year)**

```
Expiry: 2026-10
Current: 2026-09
Result: VALID (expiryMonth 10 NOT < nowMonth 9)
```

**Case 4: Expiry Year in Past**

```
Expiry: 2025-12
Current: 2026-01
Result: EXPIRED (expiryYear 2025 < nowYear 2026)
Note: Month comparison is skipped; fast path
```

**Case 5: Expiry Year in Future**

```
Expiry: 2027-01
Current: 2026-12
Result: VALID (expiryYear 2027 NOT < nowYear 2026, so proceed to Step 2)
         (expiryYear 2027 != nowYear 2026, so return false)
Note: Card is clearly valid
```

## Implementation Patterns

### Recommended Pattern (Short-Circuiting)

```pseudocode
FUNCTION isExpired(expiryYear, expiryMonth, nowYear, nowMonth):
  IF expiryYear < nowYear:
    RETURN true
  IF expiryYear == nowYear:
    RETURN expiryMonth < nowMonth
  RETURN false
```

**Advantages:**

- Clear decision tree matching business logic
- Early exit for expired-in-past-year case (common)
- No magic numbers or implicit boolean operators

### Alternative Pattern (Ternary)

```pseudocode
FUNCTION isExpired(expiryYear, expiryMonth, nowYear, nowMonth):
  RETURN (expiryYear < nowYear) OR
         (expiryYear == nowYear AND expiryMonth < nowMonth)
```

**Advantages:**

- Concise, single expression
- Easier to translate to functional languages

**Disadvantage:**

- Slightly less efficient (no short-circuit on year check), but negligible for this use case

### Anti-Pattern (Avoid)

```pseudocode
// WRONG: Uses <= instead of <, changes meaning
RETURN (expiryYear <= nowYear) AND (expiryMonth <= nowMonth)

// WRONG: Assumes month range without validation
IF expiryMonth == 0: RETURN true  // Invalid: month 0 doesn't exist

// WRONG: Encodes timezone assumptions
RETURN expiryDate.isBefore(getCurrentDate().withDayOfMonth(1))
```

## Testing Strategy

### Unit Tests (Required)

| Scenario                 | Input              | Expected | Notes                          |
| ------------------------ | ------------------ | -------- | ------------------------------ |
| Year expired, any month  | 2025, 12, 2026, 6  | EXPIRED  | Past year fast path            |
| Same year, month expired | 2026, 6, 2026, 9   | EXPIRED  | Past month, same year          |
| Same year, current month | 2026, 9, 2026, 9   | VALID    | Edge case: valid through month |
| Same year, future month  | 2026, 12, 2026, 9  | VALID    | Future month, same year        |
| Future year, any month   | 2027, 1, 2026, 12  | VALID    | Future year fast path          |
| Edge: December expiry    | 2026, 12, 2026, 12 | VALID    | Last month of year, current    |
| Edge: January expiry     | 2027, 1, 2026, 12  | VALID    | First month, far future        |

### Integration Tests (Recommended)

- Integrate with payment gateway to verify no regressions when expiry check triggers
- Test with gateway's test card suites (if they include expiry-based test cases)
- Verify refund eligibility logic does not double-check expiry (separate concern)

### Compliance & Audit

- Specification is marked as derived from legacy system version VRTX3-EXTRACT (SX-0003)
- Specification is traced to source code (`CreditCardValidator.isExpired()`, lines 12-14)
- Test results should be included in payment processor audit report

## Migration Path

### Legacy System (Current)

```
CreditCardValidator.isExpired()
  → Returns boolean
  → Called during payment authorization
  → Embedded in billing module
```

### New System (Spec-Based)

```
PaymentValidator.isCardExpired(card: Card, now: LocalDate)
  → Input: Card object with expiryMonth, expiryYear; LocalDate with month/year
  → Returns boolean
  → Called during payment authorization
  → Separate validation module/service
  → Behavior must match legacy exactly
```

### Validation Gate

Before migration is complete:

1. Run test suite against both legacy and new implementation
2. Verify 100% agreement on all test cases (including edge cases)
3. Document any intentional changes to expiry semantics (none expected)
4. Audit trail: link spec to test results to payment processor statement

## Performance Considerations

- **Complexity**: O(1) — three numeric comparisons, no loops
- **Memory**: O(1) — four input parameters, one return value
- **Optimization**: None needed; this is a utility function called once per transaction
- **Concurrency**: No shared state; safe to call concurrently

## Known Limitations & Future Work

1. **Month Range Validation**: This specification assumes month values are pre-validated (1-12). If invalid months are possible, add validation before calling.

2. **Year Bounds**: The specification works for any positive integer year. Negative years or year 0 are not explicitly handled but will work with the comparison logic.

3. **Time Zone Handling**: This specification compares year and month only; it does not account for time zone boundaries (e.g., if "now" is midnight UTC but the user's timezone is several hours behind, the meaning of "current month" shifts). System should establish a convention (UTC, local time) before calling this function.

4. **Extended Validity Periods**: Future business requirement might be to accept cards through end of next month for loyal customers. Current specification does not support parameterized validity windows; this would require design change.

## References

- **Source Code**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 12-14
- **Specification Records**: `CARD-EXPIRY-YEAR-MONTH-COMPARISON-0001`, `CARD-EXPIRY-CURRENT-MONTH-VALIDITY-0001`
- **Industry Standard**: Payment Card Industry (PCI) Data Security Standard (DSS) section on expiry handling; Visa and Mastercard association rules on valid card ranges
