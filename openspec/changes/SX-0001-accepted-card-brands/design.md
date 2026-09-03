# Design: Card Brand Acceptance Rules

**Change ID:** `SX-0001-accepted-card-brands`  
**Module:** billing · payment card validation  
**Scope:** Card brand identification, length validation, and acceptance rules

## Current Behavior (Legacy)

```java
public boolean isAcceptedBrand(String number) {
    if (number == null || number.length() < 13) return false;
    char first = number.charAt(0);
    // Visa (4) and Mastercard (5) only; Amex was dropped in 2003.
    return first == '4' || first == '5';
}
```

**Current Rules:**

- Minimum length: 13 characters
- Maximum length: No constraint
- Visa: First digit = '4'
- Mastercard: First digit = '5' (overly permissive)
- Other brands: Rejected
- Checksum (Luhn): Not validated in this module

**Issues:**

1. Mastercard accepts any card starting with '5', not just IIN ranges 51-55 and 2221-2720
2. No maximum length constraint (allows unlimited-length inputs)
3. Checksum validation responsibility unclear
4. No configuration mechanism to adjust rules

## Proposed Behavior

### Rule 1: Visa Brand Acceptance

**Requirement:** A card is a valid Visa card if and only if the first digit of the card number is '4'.

**Validation:**

- Check first character: `number.charAt(0) == '4'`
- Length constraint applied separately (Rule 3 & 4)

**Change:** No change from legacy behavior (already correct)

### Rule 2: Mastercard Brand Acceptance

**Requirement:** A card is a valid Mastercard if its IIN (Issuer Identification Number, first 4-6 digits) falls within the following ranges:

- 51-55 (legacy range, 2 digits)
- 2221-2720 (modern range, 4 digits)

**Validation:**

- Extract first 4 digits as integer
- Check if in range 51-55 OR in range 2221-2720

**Change:** Restrictive from legacy behavior (rejects '5' cards outside these ranges)

**Example:**

- `5100000000000000` — IIN 5100 → in range 51-55 → **ACCEPT**
- `5500000000000000` — IIN 5500 → in range 51-55 → **ACCEPT**
- `5600000000000000` — IIN 5600 → NOT in defined ranges → **REJECT** (currently accepted)
- `2221000000000000` — IIN 2221 → in range 2221-2720 → **ACCEPT**

### Rule 3: Minimum Card Number Length

**Requirement:** A card number must be at least 13 characters in length.

**Validation:**

- Check length: `number.length() >= 13`

**Change:** No change from legacy behavior

**Rationale:** 13 characters is the minimum across all major payment networks (Visa 16, Mastercard 16, Amex 15, Discover 16).

### Rule 4: Maximum Card Number Length

**Requirement:** A card number must not exceed 19 characters in length.

**Validation:**

- Check length: `number.length() <= 19`

**Change:** New constraint (legacy has no maximum)

**Rationale:** 19 characters accommodates current standard card lengths (Visa/Mastercard 16 + future expansion margin).

### Rule 5: Checksum Validation (Luhn Algorithm)

**Requirement:** A valid card number must satisfy the Luhn algorithm checksum.

**Validation:**

- Compute Luhn checksum per ISO/IEC 7812-1
- Checksum must equal 0 (mod 10)

**Implementation Responsibility:** **TBD by SME review**

- Option A: Implement in `CreditCardValidator.isAcceptedBrand()` method
- Option B: Implement in upstream payment gateway integration (conf/integration.properties)
- Option C: Implement in calling code (orders module)

**Rationale:** Luhn checksum is the industry standard for card number validation and prevents simple transcription errors.

## Ordering of Validation

Validation SHALL be performed in this order (fail-fast):

1. **Null check:** If number is null, return false
2. **Length check (min):** If length < 13, return false
3. **Length check (max):** If length > 19, return false
4. **Brand check:** Validate brand (Visa or Mastercard) based on first 1-4 digits
5. **Checksum check:** Validate Luhn checksum (if responsibility assigned to this module)

## Backwards Compatibility

**Breaking Change:** YES

Cards currently accepted that will be rejected:

- Any '5' card with IIN not in ranges 51-55 or 2221-2720 (e.g., 5600000000000000)
- Card numbers > 19 characters (no current standard cards exceed this; unlikely in practice)

Cards currently rejected that will be accepted:

- 2221-2720 Mastercard IINs (new range support)
- Potentially Luhn-validated cards if checksum validation is added (currently no checksum in this module)

## Risk Mitigation

- Implement with **feature flag** to allow gradual rollout
- Log rejections with IIN and reason to identify impact before full deployment
- Coordinate with payment gateway team on Luhn checksum responsibility
- Update test fixtures to cover legacy '5' cards that will now be rejected

## Integration Points

1. **Calling code (orders module):** Will reject valid non-Visa, non-Mastercard orders (if sent)
2. **Payment gateway (conf/integration.properties):** Should validate checksum on their side as well
3. **Error messages:** Must distinguish between brand rejection and length rejection for customer communication

## Future Extensibility

This design anticipates support for additional card brands by making the brand check table-driven:

```
Card Brand | IIN Range(s)        | Length
-----------|---------------------|-------
Visa       | 4                   | 16
Mastercard | 51-55, 2221-2720   | 16
Discover   | 6011, 622126-622925 | 16
Amex       | 34, 37              | 15
```

If future requirements emerge to support additional brands, the validation logic can be refactored to iterate over a configurable brand table without changing the overall structure.
