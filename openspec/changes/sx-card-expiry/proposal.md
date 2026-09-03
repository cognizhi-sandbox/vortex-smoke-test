# Card Expiry Validation — Specification Extraction Proposal

## Executive Summary

This proposal captures the credit card expiry validation logic currently embedded in the legacy petstore billing system (`CreditCardValidator.java`). The extracted specification formalizes two core requirements:

1. **Expiry Comparison Logic**: Cards are expired if their expiry year is in the past, or if the expiry year matches the current year but the expiry month is in the past.
2. **Current Month Edge Case**: Cards expiring in the current month remain valid for the entire month (standard payment card industry practice).

## Problem Statement

### Current State

The legacy billing module contains hardcoded expiry validation logic in the `CreditCardValidator` class. While the logic is explicit and working, it is:

- **Not externally documented** — the business rules are embedded in code, not in any specification document or configuration
- **Not parameterized** — changes to expiry handling (e.g., to support extended validity periods) require code changes
- **Implicitly assumes** the current month/year comparison semantics without explicit documentation of the standard payment industry practice

### Why It Matters

Card expiry validation is a critical financial control point in payment processing. Incorrect expiry handling can:

- Accept expired cards (revenue risk, compliance violation)
- Reject valid cards prematurely (customer friction, refusal-to-pay risk)
- Create disputes with payment processors if behavior deviates from card association standards

Formalizing this specification ensures:

- **Clarity**: Future developers/auditors understand the rule intent, not just the code
- **Consistency**: Any rebuild or migration maintains the same expiry semantics
- **Compliance**: Explicit alignment with payment card industry standards is documented
- **Testability**: Acceptance criteria can be formally verified against edge cases

## Proposed Specification

### Scope

This specification covers:

- ✓ Year/month comparison logic for expiry determination
- ✓ Edge case: validity through current month
- ✓ Confidence and risk classification from extracted records
- ✓ Source traceability to legacy code

Out of scope:

- ✗ Other card validation rules (brand acceptance, length, null checks) — separate specs
- ✗ Time zone handling (not in legacy code)
- ✗ Leap second edge cases (not in legacy code)
- ✗ Business policy changes (e.g., extending validity to end of next month)

### Core Requirements

**R1: Year Expiry Check**
A payment card SHALL be considered expired if its expiry year is earlier than the current year.

**R2: Month Expiry Check (Same Year)**
A payment card with an expiry year equal to the current year SHALL be considered expired if its expiry month is earlier than the current month.

**R3: Current Month Validity**
A payment card expiring in the current month SHALL be considered valid (not expired) for the entire month, consistent with payment card industry practice.

### Confidence & Risk

- **Confidence**: HIGH — both passes agree; logic is explicit in code; matches industry standard
- **Risk Class**: FINANCIAL — incorrect expiry determination directly affects revenue and compliance
- **Industry Alignment**: This implementation follows standard payment card association rules (Visa, Mastercard) where cards are valid through the last day of the expiry month

## Acceptance Criteria

1. Specification document written with requirement statements, edge case scenarios, and compliance notes
2. Traceability established from specification back to legacy code (`CreditCardValidator.isExpired()` method)
3. Test cases defined for:
   - Card expired in past year
   - Card expired in current year, past month
   - Card expiring in current month (GIVEN/WHEN/THEN)
   - Card expiring in future month
4. Design document identifies how expiry logic maps to new architecture
5. Implementation tasks identified for card validation rebuild

## Value & Impact

- **Compliance**: Explicit documentation of expiry logic ensures alignment with payment card standards
- **Maintainability**: Future developers can understand the rule without reverse-engineering code
- **Migration**: When rebuilding on new platform, expiry semantics are formally specified, not inferred from legacy code
- **Auditability**: Specification provides paper trail for payment processor and compliance audits

## Risks & Mitigations

| Risk                                                                | Mitigation                                                                        |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Current month boundary interpretation is implicit in legacy code    | Formal GIVEN/WHEN/THEN scenario documents exact behavior; test cases verify       |
| Time zone handling not specified in legacy code                     | Out of scope; system assumes UTC or local time convention consistent with legacy  |
| Migration to new platform could change numeric comparison semantics | Specification requires same less-than operator logic; test cases gate any changes |

## Next Steps

1. ✓ Specification document (this proposal + design + spec)
2. → Implementation tasks (rebuild payment validation on new stack)
3. → Testing & verification (unit + integration tests against spec)
4. → Migration gate (ensure legacy and new implementations produce identical results)
