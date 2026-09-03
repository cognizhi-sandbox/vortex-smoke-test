# Implementation Tasks: Card Brand Acceptance Rules

**Change ID:** `SX-0001-accepted-card-brands`  
**Epic:** SX-0001 specification extraction and modernization  
**Total Tasks:** 6 implementation + 3 validation = 9 total

## Task Breakdown

### Phase 1: SME Review & Decision (BLOCKER)

**Task 1.1: SME Review — Mastercard IIN Ranges**

- **Description:** Validate that Mastercard IIN ranges 51-55 and 2221-2720 are correct for 2024+ card ecosystem
- **Acceptance Criteria:**
  - [ ] Payment security team reviews current Mastercard BIN ranges
  - [ ] Confirm whether legacy range 51-55 is still in active use
  - [ ] Confirm whether modern range 2221-2720 covers all current Mastercard variants
  - [ ] Identify any test cards needed for validation
- **Effort:** 2 hours (decision gate)
- **Owner:** Payment Platform team (SME)
- **Blocks:** Task 2.1

**Task 1.2: SME Review — Luhn Checksum Responsibility**

- **Description:** Determine where Luhn validation should be implemented
- **Acceptance Criteria:**
  - [ ] Confirm whether `CreditCardValidator` should implement Luhn (Option A)
  - [ ] Confirm whether payment gateway already validates Luhn (Option B)
  - [ ] Confirm whether calling code should validate Luhn (Option C)
  - [ ] Document the chosen implementation point and rationale
- **Effort:** 1 hour (decision gate)
- **Owner:** Payment Platform + Gateway Integration teams
- **Blocks:** Task 2.3

### Phase 2: Implementation (Depends on Phase 1)

**Task 2.1: Implement Mastercard IIN Range Validation**

- **Description:** Replace single-digit '5' check with full IIN range validation
- **Acceptance Criteria:**
  - [ ] `isAcceptedBrand()` method refactored to validate Mastercard via `checkMastercardIIN()`
  - [ ] Helper method checks: first 4 digits in range 51-55 OR 2221-2720
  - [ ] Visa validation unchanged (first digit '4')
  - [ ] All existing Visa/Mastercard test cards pass
  - [ ] Test cards with IIN '56', '57', etc. are rejected
- **Effort:** 4 hours
- **Owner:** Billing team (Implementation)
- **Dependencies:** Task 1.1

**Task 2.2: Add Maximum Card Length Validation**

- **Description:** Enforce 19-character maximum card number length
- **Acceptance Criteria:**
  - [ ] `isAcceptedBrand()` checks `number.length() <= 19` before brand validation
  - [ ] Cards with 20+ characters are rejected
  - [ ] Test coverage: exactly 19, exactly 20, < 13, >= 13
  - [ ] Error message distinguishes max-length rejection
- **Effort:** 2 hours
- **Owner:** Billing team (Implementation)
- **Dependencies:** None (independent)

**Task 2.3: Implement Luhn Checksum Validation**

- **Description:** Implement Luhn algorithm validation per Task 1.2 decision
- **Acceptance Criteria (if Option A: implement in this module):**
  - [ ] `CreditCardValidator` class gains `checkLuhnChecksum(String number)` method
  - [ ] Method implements ISO/IEC 7812-1 Luhn algorithm
  - [ ] `isAcceptedBrand()` invokes checksum validation after brand/length checks
  - [ ] Unit tests validate: correct checksums pass, incorrect checksums fail
- **Acceptance Criteria (if Option B or C: document elsewhere):**
  - [ ] Comment added to `isAcceptedBrand()`: "Luhn checksum validated [by gateway / by caller]"
  - [ ] No changes to this module
  - [ ] Acceptance criteria tested by downstream team
- **Effort:** 3 hours (if Option A) or 0.5 hours (if Option B/C)
- **Owner:** Billing team (if A) or Payment Gateway team (if B) or Orders team (if C)
- **Dependencies:** Task 1.2

**Task 2.4: Update Java Documentation**

- **Description:** Add javadoc to `CreditCardValidator` explaining the rules
- **Acceptance Criteria:**
  - [ ] Class-level javadoc documents all 5 rules (Visa, Mastercard IIN, min length, max length, checksum)
  - [ ] `isAcceptedBrand()` method javadoc lists examples and edge cases
  - [ ] Comment about Amex historical context updated or removed per SME decision
- **Effort:** 1 hour
- **Owner:** Billing team (Documentation)
- **Dependencies:** Tasks 2.1, 2.2, 2.3

### Phase 3: Testing

**Task 3.1: Unit Test Coverage — Mastercard IIN**

- **Description:** Write test cases for Mastercard IIN range validation
- **Acceptance Criteria:**
  - [ ] Test file: `CreditCardValidator.test.ts` (or existing test)
  - [ ] Test cases:
    - Visa cards (digit 4): all pass ✓
    - Mastercard 51-55: all pass ✓
    - Mastercard 2221-2720: all pass ✓
    - Invalid '5' cards (5600+): all fail ✗
    - '5' cards with IIN outside ranges: all fail ✗
  - [ ] Code coverage: 100% of `checkMastercardIIN()` method
- **Effort:** 3 hours
- **Owner:** Billing team (QA)
- **Dependencies:** Task 2.1

**Task 3.2: Unit Test Coverage — Length Validation**

- **Description:** Write test cases for length validation
- **Acceptance Criteria:**
  - [ ] Test cases for: 12 chars (reject), 13 chars (accept), 19 chars (accept), 20 chars (reject)
  - [ ] Null input handled (reject)
  - [ ] Empty string handled (reject)
  - [ ] Code coverage: 100% of length validation branch
- **Effort:** 2 hours
- **Owner:** Billing team (QA)
- **Dependencies:** Task 2.2

**Task 3.3: Integration Test — Payment Flow**

- **Description:** Test card brand validation in end-to-end payment flow
- **Acceptance Criteria:**
  - [ ] E2E test simulates order with rejected card (invalid Mastercard IIN)
  - [ ] Test confirms order is rejected at billing validation step
  - [ ] Test confirms error message is appropriate for customer communication
  - [ ] Test run logs no unexpected side effects in orders module
- **Effort:** 2 hours
- **Owner:** Integration team (QA)
- **Dependencies:** Tasks 2.1, 2.2

## Sequencing & Dependencies

```
Task 1.1 (SME Mastercard ranges) ──┐
                                    ├──> Task 2.1 (Implement Mastercard IIN)
                                    │         │
Task 1.2 (SME Luhn decision) ──────┤    Task 3.1 (Unit test Mastercard)
                                    │         │
                                    ├──> Task 2.3 (Implement Luhn)
                                    │
Task 2.2 (Max length) ─────────────┼──> Task 3.2 (Unit test length)
                                    │
         Task 2.4 (Documentation) ──┴──> Task 3.3 (Integration test)
```

**Critical Path:** Task 1.1 → 1.2 → 2.1/2.3 → 3.1/3.2/3.3  
**Estimated Duration:** 3 weeks (assuming SME review takes 1 week, implementation 1 week, testing 1 week)

## Rollout Strategy

1. **Feature flag:** Implement changes behind a feature flag to allow gradual rollout
2. **Logging:** Log all rejections (IIN, reason) to measurement dashboard for 1 sprint
3. **Gradual enablement:** Enable for 5%, 25%, 75%, then 100% of traffic
4. **Monitoring:** Track rejection rates, declined payments, customer complaints
5. **Rollback plan:** If rejection rate > 0.5%, toggle feature flag to disable

## Success Criteria

- All 9 tasks completed and merged
- Test coverage: 100% of `CreditCardValidator` (existing + new code)
- Zero regressions in existing Visa payment flows
- Mastercard IIN ranges validated by SME and documented
- Luhn checksum responsibility clearly assigned and implemented
- Specification document updated in openspec registry
- Documentation updated in codebase (javadoc + comments)
- Feature flag implementation allows gradual rollout

## Risk Mitigation

| Risk                                          | Mitigation                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Rejects legitimate Mastercard transactions    | SME validation of IIN ranges; extensive test coverage; feature flag gradual rollout |
| Luhn implementation error                     | Code review by 2+ engineers; test cases for known test card numbers                 |
| Breaking change impacts customer transactions | Feature flag; logging + dashboard; rollback plan; customer communication plan       |
| Integration point failures                    | Integration tests; coordination with payment gateway team                           |
