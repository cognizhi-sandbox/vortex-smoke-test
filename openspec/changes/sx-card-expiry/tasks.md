# Card Expiry Validation — Implementation Tasks

## Overview

This document outlines the work items required to implement the card expiry validation specification in a new system or rebuild. Tasks are organized by phase: design, implementation, testing, and validation.

## Phase 1: Design & Requirements (Gating)

### Task 1.1: Establish Time Zone Convention

**Outcome**: Document whether "current year/month" means UTC, local time, or business time.

**Description**: The specification compares expiry year/month against "now" values, but does not specify time zone interpretation. This must be resolved before implementation.

**Acceptance Criteria**:

- [ ] Decision documented: UTC | local time | business time
- [ ] If local time: clarify user's timezone (browser? server? card issuer?)
- [ ] Rationale linked to payment processor requirements (Visa/Mastercard rules)
- [ ] Test cases reflect chosen convention

**Estimated Effort**: 2 hours

**Dependencies**: None

**Owner**: Payment Architecture Team

---

### Task 1.2: Validate Month Range Handling

**Outcome**: Confirm that month values (1-12) are pre-validated; document where validation occurs.

**Description**: The expiry logic assumes month values are in range 1-12. If invalid months are possible, they must be caught before calling the expiry checker, otherwise behavior is undefined (e.g., month 13 would incorrectly compare as "future").

**Acceptance Criteria**:

- [ ] Card parsing/deserialization validates month ∈ [1, 12]
- [ ] If invalid month encountered: error path documented (reject card? exception?)
- [ ] Test case exists for invalid month (e.g., month 0, month 13)
- [ ] Decision documented in spec amendment or separate validation spec

**Estimated Effort**: 1 hour

**Dependencies**: None (but blocks payment gateway integration testing)

**Owner**: Payment Validation Team

---

### Task 1.3: Review Compliance Requirements

**Outcome**: Confirm expiry handling aligns with PCI-DSS and payment processor requirements.

**Description**: Before rebuilding, verify that the extracted expiry logic meets current compliance standards. Payment processor rules may have changed since 2003 (when Amex was dropped).

**Acceptance Criteria**:

- [ ] PCI-DSS compliance review completed (expiry handling section)
- [ ] Visa and Mastercard association rules reviewed
- [ ] Any compliance gaps or policy changes documented
- [ ] Approval from compliance/legal team obtained

**Estimated Effort**: 4 hours

**Dependencies**: Task 1.1 (time zone convention)

**Owner**: Compliance Officer + Payment Architecture

---

## Phase 2: Implementation

### Task 2.1: Implement Card Expiry Validator Module

**Outcome**: Expiry validation function implemented and integrated into payment validation pipeline.

**Description**: Create the core expiry validation function. Can be implemented in any language/framework matching the new stack.

**Acceptance Criteria**:

- [ ] Function signature matches specification: `isExpired(expiryYear, expiryMonth, nowYear, nowMonth) -> boolean`
- [ ] Implementation uses recommended short-circuiting pattern (Task 1.1 design)
- [ ] Code includes inline comments explaining year/month comparison logic
- [ ] Function is pure (no side effects, no state)
- [ ] Integrated into payment validation module

**Estimated Effort**: 3 hours

**Dependencies**: Task 1.1 (time zone convention), Task 1.3 (compliance review)

**Owner**: Backend Engineer (Payment)

---

### Task 2.2: Integrate with Payment Authorization Flow

**Outcome**: Expiry check is called during payment authorization before attempting to charge.

**Description**: Wire the expiry validator into the payment processing pipeline. Must execute after card parsing and before gateway authorization request.

**Acceptance Criteria**:

- [ ] Expiry check is called on every payment attempt
- [ ] If card is expired, payment is rejected with appropriate error message
- [ ] Error message is user-friendly (not a system error code)
- [ ] Logging captures expiry check result (for debugging failed transactions)
- [ ] Expiry check does NOT double-verify refund eligibility (separate concern)

**Estimated Effort**: 4 hours

**Dependencies**: Task 2.1 (expiry validator implemented)

**Owner**: Backend Engineer (Payment)

---

### Task 2.3: Handle Edge Cases in Payment Gateway Response

**Outcome**: Payment gateway errors related to card expiry are properly classified and retried.

**Description**: Payment gateway may reject expired cards with its own error codes. Map gateway error codes to local expiry status so error handling is consistent.

**Acceptance Criteria**:

- [ ] Gateway error codes for expired card identified (check Visa/Mastercard API docs)
- [ ] Map gateway decline codes to local "expired" classification
- [ ] Log includes both local expiry check result and gateway response
- [ ] Retry logic does not attempt to charge an expired card multiple times

**Estimated Effort**: 3 hours

**Dependencies**: Task 2.2 (integration complete)

**Owner**: Backend Engineer (Payment)

---

## Phase 3: Testing

### Task 3.1: Unit Tests for Expiry Logic

**Outcome**: Test suite with 100% coverage of expiry comparison logic, including boundary conditions.

**Description**: Implement unit tests covering all scenarios from the design document (Task 3.1).

**Acceptance Criteria**:

- [ ] Test cases for all 7 scenarios (year expired, month expired, current month, future month, future year, December edge, January edge)
- [ ] Test inputs use realistic card years (2020-2030)
- [ ] Test verifies both "expired" and "valid" cases
- [ ] All tests pass with legacy implementation (regression baseline)
- [ ] Code coverage ≥ 99% for expiry logic

**Estimated Effort**: 4 hours

**Dependencies**: Task 2.1 (expiry validator implemented)

**Owner**: QA Engineer + Backend Engineer

---

### Task 3.2: Integration Tests with Payment Gateway

**Outcome**: End-to-end test confirms expiry check blocks expired cards before gateway request.

**Description**: Test the full payment authorization flow with expired test cards to verify local expiry check prevents unnecessary gateway calls.

**Acceptance Criteria**:

- [ ] Test with payment gateway's test expired card (if available)
- [ ] Verify payment is rejected locally before gateway request is sent
- [ ] Verify error message is returned to user/client
- [ ] Verify logging captures expiry rejection event
- [ ] Test with multiple expired card scenarios (past month, past year, current month boundary)

**Estimated Effort**: 5 hours

**Dependencies**: Task 2.2 (integration complete), Task 3.1 (unit tests pass)

**Owner**: QA Engineer

---

### Task 3.3: Regression Testing Against Legacy System

**Outcome**: New implementation produces identical results to legacy system on all test cases.

**Description**: Run the same test suite against both legacy (`CreditCardValidator.isExpired()`) and new implementation. Verify 100% agreement.

**Acceptance Criteria**:

- [ ] Test harness implemented to run same inputs against both implementations
- [ ] All unit test cases (Task 3.1) produce identical results
- [ ] Additional regression tests added for any discovered edge cases
- [ ] Report generated showing results comparison (legacy vs new)
- [ ] Any divergence is documented and approved

**Estimated Effort**: 6 hours

**Dependencies**: Task 3.1 (unit tests), Task 2.1 (new implementation)

**Owner**: QA Engineer

---

## Phase 4: Validation & Deployment

### Task 4.1: Compliance Audit & Sign-Off

**Outcome**: Compliance officer approves new expiry handling against PCI-DSS and payment processor rules.

**Description**: Review test results, specification, and implementation against compliance requirements. Obtain sign-off before production deployment.

**Acceptance Criteria**:

- [ ] Specification reviewed by compliance officer
- [ ] Test results reviewed for completeness
- [ ] New implementation reviewed against PCI-DSS checklist
- [ ] Compliance sign-off obtained (dated, signed)
- [ ] Any issues documented and resolved

**Estimated Effort**: 3 hours

**Dependencies**: Task 3.3 (regression testing complete), Task 1.3 (compliance review)

**Owner**: Compliance Officer

---

### Task 4.2: Payment Processor Validation

**Outcome**: Payment processor acknowledges new expiry handling aligns with their requirements.

**Description**: Notify payment processor of implementation change. Verify no additional testing or configuration is required on their side.

**Acceptance Criteria**:

- [ ] Change notification sent to payment processor (Visa/Mastercard acquiring bank)
- [ ] Documentation provided (specification + test results)
- [ ] Processor confirms no API changes or additional setup needed
- [ ] Processor response documented in ticket

**Estimated Effort**: 2 hours (async, may take days for response)

**Dependencies**: Task 4.1 (compliance sign-off)

**Owner**: Payment Partnerships

---

### Task 4.3: Production Deployment & Monitoring

**Outcome**: New expiry validator deployed to production; monitoring confirms no regression.

**Description**: Deploy the new payment validation module with expiry check enabled. Monitor payment processing metrics for anomalies.

**Acceptance Criteria**:

- [ ] Code deployed to production via standard deployment process
- [ ] Expiry check enabled for 10% of payment attempts (canary)
- [ ] Metrics monitored: payment success rate, declined rate, expiry rejection rate
- [ ] After 24 hours, if metrics are healthy, roll out to 100%
- [ ] Alert configured for unusual expiry rejection rate (e.g., > 5%)
- [ ] Rollback plan documented in case of regression

**Estimated Effort**: 4 hours (deployment) + ongoing (monitoring)

**Dependencies**: Task 4.2 (payment processor validation), Task 4.1 (compliance approval)

**Owner**: DevOps + Payment Engineering

---

### Task 4.4: Post-Deployment Validation

**Outcome**: Confirm no payment processing regressions after deployment.

**Description**: 48 hours after full production deployment, run final validation checks to confirm expiry handling is working as expected in production.

**Acceptance Criteria**:

- [ ] Compare pre/post-deployment payment decline rates (should be equivalent)
- [ ] Spot-check logs for any unexpected expiry rejections
- [ ] Verify refund processing is unaffected by expiry validator
- [ ] Customer support reports no unusual "card expired" complaints
- [ ] Final validation report generated

**Estimated Effort**: 2 hours

**Dependencies**: Task 4.3 (production deployment)

**Owner**: Payment Engineering + QA

---

## Summary

| Phase     | Task                        | Effort  | Dependencies |
| --------- | --------------------------- | ------- | ------------ |
| 1         | 1.1: Time Zone Convention   | 2h      | None         |
| 1         | 1.2: Month Range Validation | 1h      | None         |
| 1         | 1.3: Compliance Review      | 4h      | 1.1          |
| 2         | 2.1: Implement Validator    | 3h      | 1.1, 1.3     |
| 2         | 2.2: Integrate Auth Flow    | 4h      | 2.1          |
| 2         | 2.3: Gateway Error Handling | 3h      | 2.2          |
| 3         | 3.1: Unit Tests             | 4h      | 2.1          |
| 3         | 3.2: Integration Tests      | 5h      | 2.2, 3.1     |
| 3         | 3.3: Regression Testing     | 6h      | 3.1, 2.1     |
| 4         | 4.1: Compliance Audit       | 3h      | 3.3, 1.3     |
| 4         | 4.2: Processor Validation   | 2h      | 4.1          |
| 4         | 4.3: Production Deployment  | 4h      | 4.2, 4.1     |
| 4         | 4.4: Post-Deployment Check  | 2h      | 4.3          |
| **Total** |                             | **43h** |              |

**Timeline**: Approximately 2-3 weeks (including async payment processor response time).

**Team**: 4-5 engineers (backend, QA, DevOps) + 1 compliance officer + 1 payment partnerships liaison.
