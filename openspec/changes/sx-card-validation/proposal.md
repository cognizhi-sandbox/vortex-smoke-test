# Card Validation Rules — Specification Extraction Proposal

## Executive Summary

This proposal captures the credit card validation rules currently embedded in the legacy petstore billing system (`CreditCardValidator.java`). The extracted specification formalizes three core validation requirements:

1. **Null/Empty Check**: Card numbers that are null or empty SHALL be rejected immediately.
2. **Length Requirement**: Card numbers must be at least 13 digits long.
3. **Brand Acceptance**: Only Visa (first digit 4) and Mastercard (first digit 5) are accepted; all other brands are rejected.

## Problem Statement

### Current State

The legacy billing module contains hardcoded card validation rules in the `CreditCardValidator` class. While the logic is explicit and working, it is:

- **Not externally documented** — the business rules are embedded in code, not in any specification or configuration document
- **Not parameterized** — changes to card acceptance rules (e.g., to re-add Amex or modify the minimum length) require code changes
- **Not auditable** — the reason for Amex rejection (2003 date) is commented but the business rationale is lost
- **Implicitly tied to the current implementation** — brand checking is done via first-digit comparison, but the rule intent (which brands are acceptable) is not separated from the mechanism (how to detect them)

### Why It Matters

Card validation is a critical financial control point in payment processing. Incorrect validation can:

- Accept cards the payment processor won't honor (failed transactions, chargebacks)
- Reject valid cards prematurely (customer friction, lost revenue)
- Create compliance violations if validation deviates from payment processor requirements
- Make it impossible to audit why certain card types were accepted or rejected

Formalizing this specification ensures:

- **Clarity**: The business rule (which brands? what length?) is explicit and separate from the implementation
- **Auditability**: Why were these choices made? What was the business decision?
- **Flexibility**: Future changes to card acceptance rules can be made via configuration, not code changes
- **Testability**: Acceptance criteria can be formally verified against all supported card types
- **Compliance**: Explicit documentation that validation aligns with payment processor requirements

## Proposed Specification

### Scope

This specification covers:

- ✓ Null/empty card number rejection
- ✓ Minimum length requirement (13 digits)
- ✓ Brand acceptance rules (Visa/Mastercard)
- ✓ Rejection of all other brands
- ✓ Confidence and risk classification
- ✓ Source traceability to legacy code

Out of scope:

- ✗ Card expiry validation — separate specification
- ✗ Refund eligibility — separate specification
- ✗ CVV/CVC validation (not in legacy code)
- ✗ Card numbering schemes (Luhn algorithm, etc.)
- ✗ Card type detection beyond first-digit checks
- ✗ Geographic or regional card acceptance rules

### Core Requirements

**R1: Null/Empty Card Rejection**
A credit card number that is null or empty SHALL be immediately rejected and not accepted for payment processing.

**R2: Minimum Length Requirement**
A credit card number SHALL be rejected if it contains fewer than 13 digits.

**R3: Brand Acceptance**
Only credit cards with the first digit 4 (Visa) or 5 (Mastercard) SHALL be accepted. All other card brands, including American Express and all others, SHALL be rejected.

### Confidence & Risk

- **Confidence**: HIGH — all three rules are explicit in code; rules are enforced at method entry point before other checks
- **Risk Class**: FINANCIAL (rules 1 & 2), REGULATED (rule 3) — card acceptance directly affects revenue and compliance
- **Industry Alignment**: Minimum 13-digit length is conservative (most cards are 16); Visa/Mastercard acceptance is industry standard

### Historical Context

The specification documents that American Express was deliberately dropped in 2003. The exact reason (partnership, regulatory, cost, strategy) is not documented in the code. Any future decision to re-add Amex or other card types should investigate the original 2003 rationale.

## Acceptance Criteria

1. Specification document written with clear requirement statements and test cases for each rule
2. Traceability established from specification back to legacy code (`CreditCardValidator.isAcceptedBrand()` method)
3. Test cases defined for:
   - Null card number
   - Empty card number
   - Short cards (< 13 digits)
   - Cards exactly 13 digits
   - Cards > 13 digits
   - Visa cards (first digit 4)
   - Mastercard cards (first digit 5)
   - American Express (first digit 3)
   - Other card types
4. Design document identifies how validation rules map to new architecture
5. Implementation tasks identified for payment validation rebuild
6. Specification notes the 2003 Amex decision as requiring business stakeholder review

## Value & Impact

- **Business Clarity**: Separates policy (which brands? what length?) from mechanism (how to check)
- **Compliance**: Explicit documentation of card acceptance rules for payment processor and regulatory audits
- **Maintainability**: Future developers understand rule intent without reverse-engineering code
- **Migration**: When rebuilding on new platform, validation semantics are formally specified, not inferred
- **Flexibility**: Configuration-based approach enables brand/length rule changes without code deployment
- **Auditability**: Specification provides paper trail linking business decision to implementation

## Risks & Mitigations

| Risk                                                                     | Mitigation                                                                                                                   |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| First-digit brand detection is limited; doesn't detect full card schemes | Specification documents that first-digit is the only detection mechanism; mention IIN/BIN approach as future enhancement     |
| 13-digit minimum is lower than modern standards (typically 16)           | Specification documents the bare literal and recommends compliance review; test cases validate against accepted card formats |
| Amex dropout reason is undocumented                                      | Specification calls out the 2003 date as requiring business stakeholder research before any re-add decision                  |
| Null/empty handling may duplicate gateway validation                     | Specification focuses on local validation as defense-in-depth; gateway validation is independent concern                     |

## Next Steps

1. ✓ Specification documents (this proposal + design + spec)
2. → Implementation tasks (rebuild card validation on new stack with configurable rules)
3. → Testing & verification (unit + integration tests against legacy implementation)
4. → Migration gate (ensure parity between legacy and new implementations)
5. → Business review (clarify Amex dropout reason; decide on future card types)
