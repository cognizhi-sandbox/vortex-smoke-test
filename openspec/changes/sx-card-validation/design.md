# Card Validation Rules — Design

## Architecture

Card validation is a multi-stage filter that rejects invalid card numbers before they are submitted to the payment gateway. Each validation rule is applied in sequence:

1. **Null/Empty Check** — First line of defense; rejects unparseable input
2. **Length Check** — Validates minimum digit count before brand analysis
3. **Brand Check** — Ensures card brand is accepted (Visa/Mastercard)

### Current Legacy Implementation

```java
public boolean isAcceptedBrand(String number) {
  // Null and length check (guard clause)
  if (number == null || number.length() < 13) return false;

  // Brand check
  char first = number.charAt(0);
  // Visa (4) and Mastercard (5) only; Amex was dropped in 2003.
  return first == '4' || first == '5';
}
```

### Design Principles

1. **Fail Fast** — Reject invalid input at the earliest opportunity (null check before length check before brand check)
2. **No Side Effects** — Validation is a pure function; no logging, no state changes within the validator itself
3. **Explicit Rejection** — Return false immediately for any rejection reason; do not throw exceptions
4. **Configurable Brand List** — Brand rules should be externalized so policy changes don't require code deployment

## Validation Pipeline

### Stage 1: Null/Empty Check

**Input**: Card number string  
**Validation**: `number != null && number.length() > 0`  
**Outcome if Invalid**: Return false immediately  
**Purpose**: Prevent null pointer exceptions and ensure card number exists

### Stage 2: Length Check

**Input**: Non-null card number string  
**Validation**: `number.length() >= 13`  
**Outcome if Invalid**: Return false  
**Purpose**: Enforce minimum digit count before expensive brand validation

**Note**: The 13-digit minimum is conservative. Standard Visa and Mastercard cards are 16 digits. The lower minimum may be intentional (to accept international or corporate cards) or legacy (from when cards were shorter). Specification documents this as a bare literal requiring review.

### Stage 3: Brand Check

**Input**: Non-null, non-empty card number string with ≥13 digits  
**Validation**: `number.charAt(0) == '4' || number.charAt(0) == '5'`  
**Outcome if Invalid**: Return false  
**Purpose**: Ensure card brand is accepted (Visa or Mastercard)

**Brand Mapping**:

- First digit 4 → Visa
- First digit 5 → Mastercard
- First digit 3 → American Express (REJECTED as of 2003)
- Any other digit → Other card type (REJECTED)

## Error Handling

**In-Scope Errors**:

- Null card number → Reject (return false)
- Empty card number → Reject (return false)
- Too short (< 13 digits) → Reject (return false)
- Unsupported brand → Reject (return false)

**Out-of-Scope Errors**:

- Invalid character in card number (non-digit) — assumed pre-validated
- Luhn algorithm check — separate validator
- Card expiry — separate validator
- Payment gateway rejection — separate error handling

## Implementation Patterns

### Recommended Pattern (Guard Clauses)

```pseudocode
FUNCTION isAcceptedCard(number STRING) -> BOOLEAN

  // Guard clause 1: null/empty
  IF number == null OR number.length() == 0 THEN
    RETURN false
  END IF

  // Guard clause 2: minimum length
  IF number.length() < 13 THEN
    RETURN false
  END IF

  // Guard clause 3: brand acceptance
  firstDigit = number.charAt(0)
  IF firstDigit == '4' OR firstDigit == '5' THEN
    RETURN true
  ELSE
    RETURN false
  END IF

END FUNCTION
```

**Advantages**:

- Clear, readable decision path
- Early exit for invalid input (efficient)
- Matches legacy implementation

### Alternative Pattern (Configurable Brand List)

```pseudocode
FUNCTION isAcceptedCard(number STRING, acceptedBrands LIST) -> BOOLEAN

  IF number == null OR number.length() == 0 THEN
    RETURN false
  END IF

  IF number.length() < 13 THEN
    RETURN false
  END IF

  firstDigit = number.charAt(0)
  FOR EACH brand IN acceptedBrands DO
    IF brand.firstDigit == firstDigit THEN
      RETURN true
    END IF
  END FOR

  RETURN false

END FUNCTION
```

**Advantages**:

- Brand list can be externalized to configuration
- Easier to add/remove brands without code changes
- Future-proofing for business decisions (re-add Amex, support international cards)

## Testing Strategy

### Unit Tests (Required)

| Scenario              | Input                                         | Expected | Notes                                            |
| --------------------- | --------------------------------------------- | -------- | ------------------------------------------------ |
| Null card             | null                                          | false    | Guard clause catches immediately                 |
| Empty string          | ""                                            | false    | Empty string is invalid                          |
| Too short (12 digits) | "401234567890"                                | false    | Length check rejects before brand check          |
| Minimum length Visa   | "4012345678901" (13 digits, starts with 4)    | true     | Exactly 13 digits, Visa                          |
| Standard Visa         | "4532015112830366" (16 digits, starts with 4) | true     | Standard length, Visa                            |
| Mastercard            | "5105105105105100" (16 digits, starts with 5) | true     | Standard length, Mastercard                      |
| American Express      | "378282246310005" (15 digits, starts with 3)  | false    | Amex rejected as of 2003                         |
| Discover              | "6011111111111117" (16 digits, starts with 6) | false    | Not Visa/Mastercard                              |
| Short Amex            | "378282" (6 digits, starts with 3)            | false    | Too short AND wrong brand                        |
| Non-numeric prefix    | "X4012345678901"                              | false    | Invalid format (edge case; assume pre-validated) |

### Integration Tests (Recommended)

- Validate against payment gateway's test card suites
- Verify gateway rejects cards that pass local validation (no false accepts)
- Verify gateway accepts cards that pass local validation (no false rejects)
- Test with historical card schemes (Diners, JCB) to confirm rejection

### Compliance & Audit

- Specification is marked as derived from legacy system (SX-0003)
- Specification is traced to source code (`CreditCardValidator.isAcceptedBrand()`, lines 5-9)
- Test results include comparison with legacy implementation (should be 100% parity)

## Configuration Model

### Bare Literals → Configuration

Current bare literals in legacy code:

```
- Minimum length: 13 (hardcoded)
- Accepted brands: Visa (4), Mastercard (5) (hardcoded)
```

Future state (recommended):

```yaml
# card-validation-config.yaml
validation:
  minimum_length: 13
  accepted_brands:
    - name: Visa
      first_digit: "4"
    - name: Mastercard
      first_digit: "5"
```

**Benefits**:

- Policy changes via configuration, not code
- Audit trail: config change history instead of git history
- A/B testing: can validate different brand strategies in parallel

## Migration Path

### Legacy System (Current)

```
CreditCardValidator.isAcceptedBrand()
  → Takes: String number
  → Returns: boolean
  → Called during payment authorization
  → Embedded in billing module
  → Hardcoded brand list
```

### New System (Spec-Based)

```
PaymentValidator.isValidCard(card: Card, config: ValidationConfig)
  → Takes: Card object (number, expiry, cvv); ValidationConfig (brands, min_length)
  → Returns: ValidationResult (valid: boolean, reason: string)
  → Called during payment authorization
  → Separate validation module/service
  → Configurable brand list
  → Behavior must match legacy exactly
```

### Validation Gate

Before migration is complete:

1. Run test suite against both legacy and new implementation
2. Verify 100% agreement on all test cases
3. Document any intentional changes to validation rules (none expected)
4. Audit trail: link spec to test results to payment processor statement

## Known Limitations & Future Work

1. **First-Digit-Only Brand Detection**: This specification uses only the first digit to detect card brands. Modern card schemes use IIN/BIN ranges (6-digit prefix) for more precise brand detection. This is acceptable for legacy compatibility but should be considered for future enhancement.

2. **Hard Minimum Length**: The 13-digit minimum is a bare literal. Whether this is intentional (to support international cards) or legacy (from when cards were shorter) is undocumented. Compliance review recommended.

3. **Amex Dropout Reason**: The 2003 Amex removal is documented as fact but the business rationale is lost. Any future decision to re-add Amex should research the original decision.

4. **Luhn Algorithm Not Checked**: This specification does not validate card number using the Luhn algorithm (mod-10 checksum). That validation should be a separate validator if needed.

5. **Time Zone**: Not applicable to card validation (no date/time logic).

## Performance Considerations

- **Complexity**: O(1) — constant-time string operations (null check, length check, first-digit access)
- **Memory**: O(1) — no data structures created
- **Optimization**: None needed; this is a utility function called once per transaction
- **Concurrency**: No shared state; safe to call concurrently
- **Caching**: Not applicable; validation result cannot be cached across transactions (different card numbers)

## References

- **Source Code**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 5-9
- **Specification Records**: `CARD-VALIDATION-NULL-CHECK-0001`, `CARD-VALIDATION-LENGTH-REQUIREMENT-0001`, `CARD-VALIDATION-BRAND-VISA-MASTERCARD-0001`
- **Industry Standards**: PCI-DSS Data Security Standard, Visa and Mastercard association rules
- **Related Specifications**: Card Expiry Validation, Refund Eligibility
