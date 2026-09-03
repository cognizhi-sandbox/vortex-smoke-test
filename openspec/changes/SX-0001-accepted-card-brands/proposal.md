# OpenSpec Change Proposal: Card Brand Acceptance Rules

**Change ID:** `SX-0001-accepted-card-brands`  
**Source:** Spec Extraction SX-0001 · legacy petstore billing module  
**Status:** Proposed  
**Confidence:** HIGH (both extraction passes agreed)

## Problem Statement

The legacy petstore billing system enforces card brand acceptance rules that are both incomplete and overly permissive:

- **Restrictive on entry:** Only Visa (digit 4) and Mastercard (digit 5) are accepted; no other brands supported
- **Overly permissive on validation:** Mastercard acceptance checks only the first digit ('5'), not the full IIN range (51-55, 2221-2720), allowing non-Mastercard cards to pass
- **Missing length constraints:** No maximum card number length enforced; minimum is 13 characters
- **Missing integrity check:** No Luhn checksum validation performed on card numbers
- **Ambiguous historical context:** Amex was dropped in 2003, but this is hardcoded with no mechanism to re-enable it

These rules are extracted from `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java` and enforced in the `isAcceptedBrand` method (lines 5-10).

## Proposed Change

Formalize the card brand acceptance rules into a specification that:

1. **Clarifies Visa acceptance:** Visa cards start with digit 4; no additional validation beyond this single digit
2. **Refines Mastercard validation:** Document that Mastercard validation should check IIN ranges (51-55, 2221-2720) rather than accepting all '5' cards
3. **Establishes maximum length:** Add an explicit maximum card number length constraint (16 characters for Visa/Mastercard)
4. **Documents checksum validation:** Specify that Luhn algorithm validation is required (whether implemented in this module or upstream)
5. **Records historical context:** Capture that American Express was accepted historically but was dropped in 2003, with no current support

## Acceptance Criteria

- [ ] Specification document created with all five rules formally stated
- [ ] Design document specifies the delta from legacy behavior
- [ ] Implementation tasks identified for each rule change
- [ ] SME review confirms Mastercard IIN ranges and checksum responsibility
- [ ] Specification integrated into openspec registry

## Risk Assessment

**Risk Level:** MEDIUM

- **Financial Impact:** Card validation is a critical payment security boundary. Overly permissive rules allow invalid cards; overly restrictive rules reject legitimate transactions
- **Backwards Compatibility:** Refining Mastercard validation will reject some currently-accepted cards (non-Mastercard '5' cards); this is a breaking change for any system relying on the overly permissive behavior
- **Configuration Dependency:** No configuration mechanism exists to override these rules at runtime; changes require code modification

## Success Metrics

- Mastercard IIN validation reduces false positives (non-Mastercard '5' cards currently accepted)
- Maximum length constraint prevents unexpectedly long card numbers from entering the system
- Specification provides a clear target for any future card brand support (e.g., Discover, Amex re-enablement)
