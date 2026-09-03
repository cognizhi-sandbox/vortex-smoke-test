# Order Fulfillment Implementation Tasks

## Task List

### Task 1: Implement Shipping Calculator

- **Description:** Create a function that computes shipping cost based on order total and item count.
- **Acceptance Criteria:**
  - Orders ≥$75: shipping = $0
  - Orders <$75: shipping = $4.95 + ($0.75 × itemCount)
  - Function accepts decimal order total and integer item count
  - Function returns decimal shipping cost
- **Implementation File:** `fulfillment/shipping_calculator.ts` (or language equivalent)
- **Tests:** Unit tests for threshold crossing, formula correctness, edge cases

### Task 2: Implement Cancellation Checker

- **Description:** Create a function that validates whether an order can be cancelled.
- **Acceptance Criteria:**
  - PENDING status → cancellable (true)
  - APPROVED status → cancellable (true)
  - Any other status → not cancellable (false)
  - Function accepts order status string
  - Function returns boolean
- **Implementation File:** `fulfillment/cancellation_checker.ts` (or language equivalent)
- **Tests:** Unit tests for all allowed/rejected statuses

### Task 3: Integrate Shipping Calculator into Order Flow

- **Description:** Wire the shipping calculator into the order creation/management pipeline.
- **Acceptance Criteria:**
  - Shipping cost is calculated before order confirmation
  - Calculation result is stored with order
  - Free shipping is correctly applied for qualifying orders
- **Implementation File:** `fulfillment/order_processor.ts` (or language equivalent)
- **Tests:** Integration tests with mock order repository

### Task 4: Integrate Cancellation Checker into Order Flow

- **Description:** Wire the cancellation checker into the cancellation request handler.
- **Acceptance Criteria:**
  - Cancellation validation runs before processing
  - Non-cancellable orders return appropriate error
  - PENDING/APPROVED orders proceed to cancellation
- **Implementation File:** `fulfillment/order_processor.ts` (or language equivalent)
- **Tests:** Integration tests with mock order state transitions

### Task 5: Add Comprehensive Unit Tests

- **Description:** Create unit test suite for shipping and cancellation logic.
- **Acceptance Criteria:**
  - Shipping tests cover threshold boundary ($74.99, $75.00, $75.01)
  - Shipping tests cover formula with varying item counts (0, 1, 5, 100 items)
  - Cancellation tests cover all statuses (PENDING, APPROVED, SHIPPED, FULFILLED, FAILED)
  - Edge cases covered (null input, empty string)
  - All tests pass
- **Implementation File:** `fulfillment/fulfillment.test.ts` (or language equivalent)
- **Tests:** Minimum 15 test cases

### Task 6: Add E2E Fulfillment Tests

- **Description:** Create end-to-end tests for order fulfillment workflow.
- **Acceptance Criteria:**
  - E2E test: create order <$75, verify shipping calculated correctly
  - E2E test: create order ≥$75, verify free shipping applied
  - E2E test: cancel PENDING order, verify succeeds
  - E2E test: cancel SHIPPED order, verify fails with error
- **Implementation File:** `e2e/fulfillment.spec.ts` (or language equivalent)
- **Tests:** Minimum 4 E2E test cases

### Task 7: Resolve Shipping Rate Ambiguity

- **Description:** Document or confirm the shipping rate components.
- **Acceptance Criteria:**
  - Cost basis for $4.95 flat rate is documented
  - Cost basis for $0.75 per-item rate is documented
  - Rate review cycle (if any) is recorded
  - OR, after review, rates are changed if determined to be stale
  - Decision is recorded in ARCHITECTURE.md decision log
- **Implementation File:** `ARCHITECTURE.md`
- **Tests:** N/A (documentation only)

### Task 8: Document Order Status Enumeration

- **Description:** Formally enumerate all valid order statuses.
- **Acceptance Criteria:**
  - All possible order statuses are listed
  - State transition diagram or matrix is documented
  - Cancellation eligibility per status is explicit
  - Decision is recorded in ARCHITECTURE.md decision log
- **Implementation File:** `ARCHITECTURE.md`
- **Tests:** N/A (documentation only)

## Testing Strategy

### Unit Test Checklist

- [ ] Shipping: threshold boundary tests ($74.99, $75.00, $75.01)
- [ ] Shipping: formula tests (0, 1, 5, 10, 100 items)
- [ ] Shipping: null/invalid input handling
- [ ] Cancellation: PENDING status allowed
- [ ] Cancellation: APPROVED status allowed
- [ ] Cancellation: other statuses rejected (SHIPPED, FULFILLED, FAILED, null)

### E2E Test Checklist

- [ ] Create order <$75, verify shipping = $4.95 + ($0.75 × items)
- [ ] Create order ≥$75, verify shipping = $0
- [ ] Cancel order in PENDING state succeeds
- [ ] Cancel order in APPROVED state succeeds
- [ ] Attempt to cancel SHIPPED order fails with error
- [ ] Attempt to cancel FULFILLED order fails with error

## Deployment

1. Implement shipping calculator and cancellation checker (Tasks 1-2)
2. Add comprehensive unit tests (Task 5)
3. Integrate into order flow (Tasks 3-4)
4. Add E2E tests (Task 6)
5. Document shipping rates and status enumeration (Tasks 7-8)
6. Deploy to staging, run smoke tests
7. Deploy to production
8. Monitor fulfillment SLAs and cancellation request patterns

## Rollback Plan

If shipping calculation causes revenue impact or fulfillment delays:

1. Revert to legacy shipping calculation
2. Increase free shipping threshold if rates are too high
3. Adjust per-item rate if handling cost assumptions were wrong
4. Escalate to business for policy decision

If cancellation checker blocks legitimate cancellations:

1. Temporarily allow additional statuses (consult with fulfillment team)
2. Review order status state machine with operations
3. Adjust eligibility rules per business guidance
