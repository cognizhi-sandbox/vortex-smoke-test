# Shipping Cost — Implementation Tasks

## Phase 1: Design & Requirements

### Task 1.1: Validate Threshold and Rate Values

- **Outcome**: Confirm $75.00 threshold and $4.95/$0.75 rates align with current business strategy
- **Description**: Research original rationale for shipping threshold and cost structure. Verify against current logistics costs, competitor rates, and margin targets
- **Acceptance Criteria**:
  - [ ] Business stakeholder interviewed about $75.00 threshold (margin target? cost recovery point? competitive rate?)
  - [ ] Finance reviewed $4.95 base fee vs actual shipping costs
  - [ ] Finance reviewed $0.75 per-item charge vs actual handling costs
  - [ ] Any changes to values documented and approved
  - [ ] Rationale recorded in configuration or comments
- **Estimated Effort**: 4 hours
- **Owner**: Product / Finance

### Task 1.2: Define Rounding Policy

- **Outcome**: Document how fractional cents are handled in shipping calculations
- **Description**: Determine whether to round, truncate, or use banker's rounding. Verify consistency with payment processing gateway expectations
- **Acceptance Criteria**:
  - [ ] Rounding rule chosen (round, truncate, banker's rounding, etc.)
  - [ ] Documented in specification and configuration
  - [ ] Payment gateway's rounding expectations reviewed
  - [ ] Test cases for edge cases (e.g., $4.95 + $2.25 = $7.20)
- **Estimated Effort**: 2 hours
- **Owner**: Finance / Engineering

### Task 1.3: Identify Regional Variants

- **Outcome**: Determine whether single shipping model or region-specific variants needed
- **Description**: Confirm whether one shipping model serves all customer regions or whether regional variants (international, remote areas) are needed
- **Acceptance Criteria**:
  - [ ] Current shipping coverage area(s) identified
  - [ ] Decision made: single model or variants?
  - [ ] If variants needed, outline structure and priorities
  - [ ] Out-of-scope regions identified
- **Estimated Effort**: 2 hours
- **Owner**: Operations / Product

## Phase 2: Implementation

### Task 2.1: Implement Shipping Cost Module

- **Outcome**: Shipping cost calculation function with configurable thresholds and rates
- **Description**: Create the core shippingCost function with guard-clause pattern and externalized configuration
- **Acceptance Criteria**:
  - [ ] shippingCost(orderTotal, itemCount, config) → double implemented
  - [ ] Free threshold check: orderTotal >= config.freeThreshold
  - [ ] Charged calculation: baseFee + (itemCount × perItemCharge)
  - [ ] Rounding applied per policy from Task 1.2
  - [ ] Function is pure (no side effects, no logging within function)
  - [ ] Code comments explain threshold vs charged logic
  - [ ] Integrated into order processing module
- **Estimated Effort**: 3 hours
- **Owner**: Backend Engineer

### Task 2.2: Externalize Shipping Configuration

- **Outcome**: Threshold and rates moved to configuration; not hardcoded
- **Description**: Define configuration structure for shipping costs and load at application startup
- **Acceptance Criteria**:
  - [ ] Configuration schema defined (YAML, JSON, or database table)
  - [ ] Fields: free_threshold, base_fee, per_item_charge
  - [ ] Configuration loaded at startup; defaults match legacy values ($75.00, $4.95, $0.75)
  - [ ] Hot-reload capability optional but recommended
  - [ ] Rationale/comments added to configuration template
- **Estimated Effort**: 2 hours
- **Owner**: Backend Engineer / DevOps

### Task 2.3: Integrate with Order Processing

- **Outcome**: Shipping cost calculation called during order total computation
- **Description**: Wire the shippingCost function into the order total pipeline (before tax, after discounts)
- **Acceptance Criteria**:
  - [ ] shippingCost() called when order is finalized
  - [ ] Result displayed in order summary to customer
  - [ ] Result stored in order record for audit trail
  - [ ] API endpoint returns shipping cost in order responses
  - [ ] Logging captures shipping cost decision point
- **Estimated Effort**: 3 hours
- **Owner**: Backend Engineer

### Task 2.4: Validate Against Legacy Behavior

- **Outcome**: New implementation produces identical results to legacy for representative orders
- **Description**: Test suite comparing new and legacy implementations across representative order scenarios
- **Acceptance Criteria**:
  - [ ] 20+ representative orders tested (various totals, item counts)
  - [ ] New implementation matches legacy results (exact penny match)
  - [ ] Edge cases verified (threshold boundaries, single item, zero items)
  - [ ] Regression baseline documented
- **Estimated Effort**: 2 hours
- **Owner**: QA Engineer

## Phase 3: Testing

### Task 3.1: Unit Tests for Shipping Cost

- **Outcome**: 100% code coverage on shipping cost calculation logic
- **Description**: Test suite covering all branches and edge cases
- **Acceptance Criteria**:
  - [ ] Test case for free shipping (at threshold)
  - [ ] Test case for free shipping (above threshold)
  - [ ] Test case for charged shipping (single item)
  - [ ] Test case for charged shipping (multiple items)
  - [ ] Test case for charged shipping (zero items)
  - [ ] Boundary test (just below threshold, e.g., $74.99)
  - [ ] Test for rounding behavior
  - [ ] All tests pass with legacy configuration values
  - [ ] Code coverage ≥ 99% for shipping logic
- **Estimated Effort**: 3 hours
- **Owner**: QA Engineer

### Task 3.2: Integration Tests with Order Processing

- **Outcome**: End-to-end test confirms shipping cost integrates with order total, tax, discounts
- **Description**: Test full order processing pipeline with shipping cost calculation
- **Acceptance Criteria**:
  - [ ] Test order creation with shipping cost calculation
  - [ ] Test order total = subtotal + tax + shipping
  - [ ] Test discount application before shipping (if applicable)
  - [ ] Test order display shows breakdown of costs
  - [ ] Test order record persistence includes shipping cost
  - [ ] Test API response includes shipping cost
- **Estimated Effort**: 3 hours
- **Owner**: QA Engineer

## Phase 4: Validation

### Task 4.1: Configuration Review

- **Effort**: 1 hour
- **Owner**: DevOps / Infrastructure

### Task 4.2: Business Sign-Off

- **Effort**: 1 hour
- **Owner**: Product / Finance

### Task 4.3: Deployment & Monitoring

- **Effort**: 2 hours
- **Owner**: DevOps
- **Notes**: Monitor shipping cost calculations during first week; verify no revenue anomalies

---

## Summary

**Total**: ~28-30 hours across 4 phases

**Timeline**: 2-3 weeks (includes async stakeholder feedback)

**Team**: 2-3 engineers (backend, QA, DevOps) + finance stakeholder
