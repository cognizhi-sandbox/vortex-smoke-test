# Card Acceptance Specification Change

## Proposal

Extract and formalize the card acceptance rules from the legacy Pet Store application. This change defines which credit cards the system accepts, validates card properties, and establishes refund eligibility policies.

## Business Value

- **Payment Processing:** Defines the card brand policy (Visa/Mastercard) that determines transaction success and payment partner integration.
- **Regulatory Compliance:** Codifies PCI DSS requirements for card validation (brand restrictions, expiry checking).
- **Customer Experience:** Establishes clear rules for card acceptance/rejection and refund eligibility (90-day window).
- **Audit Trail:** Documents financial rules that fall under SOX internal controls and authorization matrices.

## Risk Class

**Financial** — Card acceptance rules directly affect transaction success rates, refund liability, and revenue recognition.

## Scope

This change formalizes three requirements:

1. **Brand acceptance:** Only Visa (digit 4) and Mastercard (digit 5)
2. **Card validation:** Minimum 13-digit card numbers; expiry check (year-first, month-inclusive)
3. **Refund eligibility:** 90-day post-settlement window (covered in refund-policy capability)

## Out of Scope

- Integration with payment gateway (operational deployment concern)
- UI/error messages for rejected cards (presentation layer)
- Card storage and PCI compliance infrastructure (handled by payment processor)
- Amex reconsidering decision (business strategy, noted as ambiguity)

## Key Ambiguities for SME Review

1. **Why 13-digit minimum?** Industry standard allows 12-19 digits. The choice to reject 12-digit cards needs business justification.
2. **Amex history:** Code notes "dropped in 2003" but provides no reason (contract, fraud, market, regulatory). If Amex acceptance is reconsidered, this history should be preserved.

## Confidence Assessment

- **High confidence (2 rules):** Brand acceptance and expiry validation — both clearly implemented and independently verified.
- **Low confidence (1 rule):** 13-digit minimum — bare literal with no documented justification, needs SME review.

## Next Steps

1. **Design:** Document the card acceptance algorithm and validation rules.
2. **Implementation:** Code validation functions in the new system.
3. **Testing:** Unit tests for brand validation, expiry boundary conditions, and error cases.
4. **Validation:** E2E tests with real payment scenarios.
