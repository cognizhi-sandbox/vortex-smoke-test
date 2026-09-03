# Card Validation Rules — Implementation Tasks

## Overview

This document outlines the work items required to implement the card validation specification in a new system or rebuild. Tasks are organized by phase: design, implementation, testing, and validation.

## Phase 1: Design & Requirements

### Task 1.1: Clarify Amex Dropout Rationale

**Outcome**: Document why American Express was dropped in 2003; inform future brand strategy.

**Description**: The legacy code comments "Amex was dropped in 2003" but does not explain why. Possible reasons: partnership/contract change, regulatory compliance, cost structure, business decision. Understanding the rationale is important for any future card type decisions.

**Acceptance Criteria**:

- [ ] Historical research completed or business stakeholder interviewed
- [ ] Rationale documented (partnership, regulatory, cost, strategy, other)
- [ ] Decision recorded in specification amendments or decision log
- [ ] Future card type decisions reference this rationale

**Estimated Effort**: 2 hours (async, includes research + stakeholder interview)

**Dependencies**: None

**Owner**: Product/Business Team

---

### Task 1.2: Review Card Length Requirements

**Outcome**: Confirm whether 13-digit minimum is intentional or legacy; decide on future minimum.

**Description**: The 13-digit minimum is lower than modern standards (typically 16). Confirm whether this is intentional (international/corporate cards) or legacy (from when cards were shorter). Recommend length for new system.

**Acceptance Criteria**:

- [ ] Payment processor's card length requirements reviewed
- [ ] International/corporate card requirements researched (if applicable)
- [ ] Decision documented: keep 13 or increase to 14/15/16?
- [ ] Compliance implications documented

**Estimated Effort**: 3 hours

**Dependencies**: None

**Owner**: Payment Architecture + Compliance

---

### Task 1.3: Validate Brand Acceptance Rules

**Outcome**: Confirm Visa/Mastercard-only policy meets current business and compliance requirements.

**Description**: Before rebuilding, verify that accepting only Visa/Mastercard aligns with current business strategy and compliance. Are there plans to re-add Amex? Support Discover? International schemes?

**Acceptance Criteria**:

- [ ] Payment processor's supported card types reviewed
- [ ] Business strategy for card acceptance reviewed (any plans for Amex, Discover, etc.?)
- [ ] PCI-DSS requirements for brand acceptance reviewed
- [ ] Decision documented: Visa/Mastercard only, or extend to other brands?
- [ ] Compliance sign-off obtained

**Estimated Effort**: 4 hours

**Dependencies**: Task 1.1 (Amex rationale)

**Owner**: Compliance Officer + Payment Architecture

---

## Phase 2: Implementation

### Task 2.1: Implement Card Validation Module

**Outcome**: Card validation function(s) implemented and integrated into payment validation pipeline.

**Description**: Create the card validation function with null, length, and brand checks. Implement using guard-clause pattern (recommended) or configurable pattern (future-proof).

**Acceptance Criteria**:

- [ ] Validation function implemented with three stages: null/empty, length, brand
- [ ] Null check: number != null && number.length() > 0
- [ ] Length check: number.length() >= 13
- [ ] Brand check: first digit in ['4', '5']
- [ ] Function is pure (no side effects, no logging in validator itself)
- [ ] Code includes comments explaining each validation stage
- [ ] Integrated into payment validation module

**Estimated Effort**: 4 hours

**Dependencies**: Task 1.1 (Amex rationale), Task 1.2 (length requirement), Task 1.3 (brand rules)

**Owner**: Backend Engineer (Payment)

---

### Task 2.2: Externalize Card Validation Configuration

**Outcome**: Brand list and minimum length are externalized to configuration, not hardcoded.

**Description**: Move validation rules to configuration file so future changes don't require code deployment.

**Acceptance Criteria**:

- [ ] Configuration file created (YAML, JSON, or database table)
- [ ] Configuration schema defined: minimum_length, accepted_brands list
- [ ] Validator loads configuration at startup and caches it
- [ ] Configuration hot-reload capability (optional, but recommended)
- [ ] Default configuration matches legacy rules (Visa '4', Mastercard '5', length 13)

**Estimated Effort**: 3 hours

**Dependencies**: Task 2.1 (validator implemented)

**Owner**: Backend Engineer (Payment)

---

### Task 2.3: Integrate with Payment Authorization Flow

**Outcome**: Card validation is called on every payment attempt before gateway submission.

**Description**: Wire the card validator into the payment authorization pipeline. Must execute after card parsing and before gateway API call.

**Acceptance Criteria**:

- [ ] Validation is called on every payment attempt
- [ ] If validation fails, payment is rejected immediately
- [ ] Error message returned to user is user-friendly (not a system error)
- [ ] Error categorization: null, short, unsupported brand
- [ ] Logging captures validation result for debugging failed transactions

**Estimated Effort**: 4 hours

**Dependencies**: Task 2.1 (validator implemented), Task 2.2 (configuration integrated)

**Owner**: Backend Engineer (Payment)

---

### Task 2.4: Handle Gateway Validation Gaps

**Outcome**: Validate that gateway validation and local validation are complementary, not redundant.

**Description**: Payment gateway may perform its own card validation. Map gateway error codes to local validation results to understand whether local validation is detecting issues before gateway, or if gateway finds issues local validation missed.

**Acceptance Criteria**:

- [ ] Gateway error codes for invalid cards identified (check API docs)
- [ ] Comparison chart created: local validation checks vs gateway validation checks
- [ ] Log analysis: confirm local validation rejects most invalid cards before gateway call
- [ ] If gateway rejects cards that pass local validation, escalate for investigation

**Estimated Effort**: 3 hours

**Dependencies**: Task 2.3 (integration complete)

**Owner**: Backend Engineer (Payment)

---

## Phase 3: Testing

### Task 3.1: Unit Tests for Card Validation

**Outcome**: Test suite with 100% coverage of all validation stages and card types.

**Description**: Implement unit tests for null, length, and brand validation. Include edge cases.

**Acceptance Criteria**:

- [ ] Test cases for all 10 scenarios (null, empty, too short, min length, standard, Visa, Mastercard, Amex, Discover, other)
- [ ] Test inputs use realistic card numbers
- [ ] All tests pass with legacy implementation (regression baseline)
- [ ] Code coverage ≥ 99% for validation logic
- [ ] Edge cases documented: empty string, single digit, exactly 13 digits, etc.

**Estimated Effort**: 4 hours

**Dependencies**: Task 2.1 (validator implemented)

**Owner**: QA Engineer + Backend Engineer

---

### Task 3.2: Integration Tests with Payment Gateway

**Outcome**: End-to-end test confirms card validation works correctly with gateway.

**Description**: Test the full payment authorization flow with various card types to verify local validation interacts correctly with gateway.

**Acceptance Criteria**:

- [ ] Test with payment gateway's test card suite
- [ ] Verify accepted cards (Visa, Mastercard) are submitted to gateway
- [ ] Verify rejected cards (Amex, short cards, null) are rejected locally
- [ ] Verify gateway does not attempt processing rejected cards
- [ ] Error messages are returned to user correctly

**Estimated Effort**: 5 hours

**Dependencies**: Task 2.3 (integration complete), Task 3.1 (unit tests pass)

**Owner**: QA Engineer

---

### Task 3.3: Regression Testing Against Legacy System

**Outcome**: New implementation produces identical results to legacy system on all test cases.

**Description**: Run the same test suite against both legacy (`CreditCardValidator.isAcceptedBrand()`) and new implementation.

**Acceptance Criteria**:

- [ ] Test harness implemented to run same inputs against both implementations
- [ ] All unit test cases (Task 3.1) produce identical results
- [ ] Additional regression tests added for any discovered edge cases
- [ ] Report generated: legacy vs new comparison
- [ ] Any divergence is documented and approved

**Estimated Effort**: 5 hours

**Dependencies**: Task 3.1 (unit tests), Task 2.1 (new implementation)

**Owner**: QA Engineer

---

## Phase 4: Validation & Deployment

### Task 4.1: Compliance Audit & Sign-Off

**Outcome**: Compliance officer approves new card validation against PCI-DSS and payment processor rules.

**Description**: Review test results and implementation against compliance requirements. Obtain sign-off before production.

**Acceptance Criteria**:

- [ ] Specification reviewed by compliance officer
- [ ] Test results reviewed for completeness
- [ ] New implementation reviewed against PCI-DSS card acceptance requirements
- [ ] Gateway requirements confirmed (supported brands, minimum length)
- [ ] Compliance sign-off obtained (dated, signed)

**Estimated Effort**: 2 hours

**Dependencies**: Task 3.3 (regression testing complete), Task 1.3 (brand rules approved)

**Owner**: Compliance Officer

---

### Task 4.2: Payment Processor Notification

**Outcome**: Payment processor aware of new validation implementation; confirms no API changes needed.

**Description**: Notify payment processor of card validation changes. Verify no additional testing or configuration required.

**Acceptance Criteria**:

- [ ] Change notification sent to payment processor (acquiring bank)
- [ ] Documentation provided (specification + test results)
- [ ] Processor confirms validation approach is compatible with their rules
- [ ] Processor response documented in ticket

**Estimated Effort**: 2 hours (async)

**Dependencies**: Task 4.1 (compliance sign-off)

**Owner**: Payment Partnerships

---

### Task 4.3: Production Deployment & Monitoring

**Outcome**: New card validation deployed to production; monitoring confirms no regression.

**Description**: Deploy new validation with monitoring to detect any issues.

**Acceptance Criteria**:

- [ ] Code deployed to production via standard deployment process
- [ ] Validation enabled for 10% of payment attempts (canary)
- [ ] Metrics monitored: payment success rate, rejected rate by reason (null, short, unsupported brand)
- [ ] After 24 hours, if metrics are healthy, roll out to 100%
- [ ] Alerts configured for unusual rejection rates
- [ ] Rollback plan documented

**Estimated Effort**: 4 hours (deployment) + ongoing (monitoring)

**Dependencies**: Task 4.2 (processor notification), Task 4.1 (compliance approval)

**Owner**: DevOps + Payment Engineering

---

### Task 4.4: Post-Deployment Validation

**Outcome**: Confirm no regressions after production deployment.

**Description**: 48 hours after full deployment, run final validation checks.

**Acceptance Criteria**:

- [ ] Compare pre/post-deployment payment acceptance rates (should be equivalent)
- [ ] Spot-check logs for any unexpected rejections
- [ ] Verify no false rejects (legitimate cards being rejected)
- [ ] Customer support reports no unusual "card rejected" complaints
- [ ] Final validation report generated

**Estimated Effort**: 2 hours

**Dependencies**: Task 4.3 (production deployment)

**Owner**: Payment Engineering + QA

---

## Summary

| Phase     | Task                           | Effort  | Dependencies  |
| --------- | ------------------------------ | ------- | ------------- |
| 1         | 1.1: Amex Dropout Rationale    | 2h      | None          |
| 1         | 1.2: Card Length Requirements  | 3h      | None          |
| 1         | 1.3: Brand Acceptance Rules    | 4h      | 1.1           |
| 2         | 2.1: Implement Validation      | 4h      | 1.1, 1.2, 1.3 |
| 2         | 2.2: Externalize Configuration | 3h      | 2.1           |
| 2         | 2.3: Integrate Auth Flow       | 4h      | 2.1, 2.2      |
| 2         | 2.4: Gateway Validation Gap    | 3h      | 2.3           |
| 3         | 3.1: Unit Tests                | 4h      | 2.1           |
| 3         | 3.2: Integration Tests         | 5h      | 2.3, 3.1      |
| 3         | 3.3: Regression Testing        | 5h      | 3.1, 2.1      |
| 4         | 4.1: Compliance Audit          | 2h      | 3.3, 1.3      |
| 4         | 4.2: Processor Notification    | 2h      | 4.1           |
| 4         | 4.3: Production Deployment     | 4h      | 4.2, 4.1      |
| 4         | 4.4: Post-Deployment Check     | 2h      | 4.3           |
| **Total** |                                | **47h** |               |

**Timeline**: Approximately 2-3 weeks (including async stakeholder/processor responses).

**Team**: 4-5 engineers (backend, QA, DevOps) + 1 compliance officer + 1 payment partnerships liaison + 1 product/business owner.

## Notes

- Task 1.1 (Amex rationale) is critical for future business decisions on card types. Do not skip.
- Task 1.2 (length requirements) should be completed before implementation to avoid rework.
- Configuration externalization (Task 2.2) adds 3 hours but saves significant time on future policy changes.
- Regression testing (Task 3.3) is mandatory; 100% parity with legacy is required.
