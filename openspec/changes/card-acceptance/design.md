# Card Acceptance Technical Design

## Architecture

The card acceptance rules are enforced as a validation layer in the payment processing pipeline. The validation is stateless and deterministic.

### Components

1. **Card Brand Validator**
   - Input: Card number (string)
   - Processing: Extract first digit, compare against accepted brands (4 or 5)
   - Output: Boolean (accepted/rejected)
   - Errors: Null card, too short, unknown brand

2. **Card Expiry Validator**
   - Input: Expiry year (int), expiry month (int), current year (int), current month (int)
   - Processing: Year-first comparison; if years equal, compare months
   - Output: Boolean (expired/valid)
   - Boundary: Month is inclusive (expiry month is valid)

3. **Card Length Validator**
   - Input: Card number (string)
   - Processing: Check length >= 13
   - Output: Boolean (valid length/too short)

### Validation Chain

```
Card Number Input
  ├── Length Check (>= 13 digits)
  ├── Brand Check (first digit in [4, 5])
  ├── Null/empty check
  └── Expiry Check (separate from brand validation)
      ├── Year comparison
      └── Month comparison (if years equal)
```

### Data Flow

1. **Inbound:** Card details from payment form
2. **Validation:** Run through validators in sequence
3. **Decision:** Accept or reject card
4. **Outbound:** Send to payment gateway (if accepted) or return error to user

## Implementation Notes

### Card Brand Detection

The current implementation uses the first digit of the card number:

- Leading digit **4** → Visa
- Leading digit **5** → Mastercard
- All others → Rejected

This is a simplified heuristic that does not perform full Luhn validation or IIN lookup. Future versions may use a card BIN (Bank Identification Number) database for more accurate brand detection.

### Expiry Validation

The expiry month is **inclusive** — a card expiring in December is valid through December 31st:

- If expiry year < current year → Expired
- If expiry year = current year AND expiry month < current month → Expired
- Otherwise → Valid

### Minimum Length

The 13-digit minimum is **NOT** justified in the legacy code. Industry standard ISO/IEC 7812 allows 12-19 digits. The choice to reject 12-digit cards needs review — this may be intentional (legacy card rejection) or arbitrary.

## API Contract

```typescript
interface CardValidator {
  isAcceptedBrand(cardNumber: string): boolean
  isExpired(expiryYear: number, expiryMonth: number, nowYear: number, nowMonth: number): boolean
  validateCard(cardNumber: string, expiryYear: number, expiryMonth: number): ValidationResult
}

interface ValidationResult {
  accepted: boolean
  errors: string[] // e.g., ["Card too short", "Brand not accepted", "Card expired"]
}
```

## Configuration

All thresholds are currently hardcoded:

- Accepted brands: [4, 5]
- Minimum card length: 13 digits

Future versions should move these to configuration if business rules change.

## Testing Strategy

1. **Unit tests** for each validator (brand, expiry, length)
2. **Boundary tests** for expiry month edge cases (same month, same year)
3. **Integration tests** with payment gateway integration
4. **E2E tests** for end-to-end card validation flow

## Open Questions

1. Should 12-digit cards be accepted? (Currently rejected; needs business review)
2. Should Amex be reconsidered? (Currently dropped as of 2003; business reason unknown)
3. Should we implement full Luhn validation in addition to length/brand checks?
4. What is the card BIN lookup strategy (if any)?
