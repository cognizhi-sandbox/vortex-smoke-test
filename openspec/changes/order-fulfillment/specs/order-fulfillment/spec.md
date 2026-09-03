# Order Fulfillment Specification

## Overview

The order fulfillment capability defines the rules for calculating shipping costs and determining order cancellation eligibility based on order status.

**Extracted from:** Pet Store Legacy Application (legacy-source/modules/orders/)  
**Confidence:** Medium (3 rules, 2 ambiguities requiring review)  
**Risk Class:** Operational (SLAs, fulfillment efficiency, customer service impact)

## Rules

### Rule 1: Free Shipping Threshold

**Requirement:** The system SHALL provide free shipping for orders with a total amount of $75 or more. Orders below $75 are subject to shipping charges.

**Confidence:** Medium

**Trace:** `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java:7-8,19`

**Implementation:**

```java
private static final double FREE_SHIPPING_MIN = 75.00d;

public double shippingCost(double orderTotal, int itemCount) {
    if (orderTotal >= FREE_SHIPPING_MIN) return 0.0d;
    // ...
}
```

**Rationale:** The $75 threshold is a clear margin control lever. Orders meeting or exceeding this amount are qualified for promotional free shipping, improving customer satisfaction without eroding order profitability.

**Edge Cases:**

- Order total = $74.99 → Shipping charges apply
- Order total = $75.00 → Free shipping
- Order total = $75.01 → Free shipping
- Order total with decimals (e.g., $75.50) → Free shipping if ≥ $75.00

**Boundary Condition:** Orders totaling exactly $75.00 qualify for free shipping (inclusive threshold).

---

### Rule 2: Shipping Cost Formula

**Requirement:** For orders below $75 (subject to shipping charges), the shipping cost SHALL be calculated as a flat rate of $4.95 plus a per-item handling charge of $0.75 per item in the order.

Formula: `shipping = 4.95 + (itemCount * 0.75)`

**Confidence:** Low

**Trace:** `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java:20-21`

**Implementation:**

```java
// Flat rate plus a per-item handling charge.
return 4.95d + (itemCount * 0.75d);
```

**Rationale:** The two-component formula (flat + per-item) reflects the cost structure of order fulfillment: fixed handling/packaging ($4.95) plus variable cost per unit shipped ($0.75).

**Ambiguity:** The specific values ($4.95 and $0.75) are bare literals with no documented cost basis. When were these rates established? Are they reviewed annually? **This requires SME review.**

**Edge Cases:**

- Zero items: shipping = $4.95 (flat rate only)
- One item: shipping = $4.95 + $0.75 = $5.70
- Ten items: shipping = $4.95 + ($0.75 × 10) = $12.45
- Hundred items: shipping = $4.95 + ($0.75 × 100) = $79.95

**Implicit Assumptions:**

- Item count is non-negative integer
- Shipping cost may exceed order total for small orders with many items
- No volume discounts applied to per-item rate

---

### Rule 3: Order Cancellation Eligibility

**Requirement:** Orders may be cancelled only when in a state prior to fulfillment commencement. Specifically, orders with status PENDING or APPROVED may be cancelled. Orders in any other status cannot be cancelled.

GIVEN an order with status PENDING, THEN cancellation is permitted.  
GIVEN an order with status APPROVED, THEN cancellation is permitted.  
GIVEN an order with any other status (e.g., SHIPPED, FULFILLED, FAILED), THEN cancellation is not permitted.

**Confidence:** Medium

**Trace:** `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java:24-26`

**Implementation:**

```java
public boolean canCancel(String status) {
    // An order may only be cancelled before it enters fulfilment.
    return "PENDING".equals(status) || "APPROVED".equals(status);
}
```

**Rationale:** Orders in PENDING or APPROVED state have not yet been picked/packed/shipped. Cancellation is operationally feasible and customer-friendly at these stages. Once fulfillment begins (SHIPPED or beyond), cancellation becomes costly and logistically complex.

**Edge Cases:**

- Null status → Cancelled (not permitted; null input should be rejected upstream)
- Empty string "" → Cancelled (not permitted)
- Case-sensitive comparison: "pending" (lowercase) → Cancelled (not permitted; comparison is case-sensitive)
- Unknown status → Cancelled (not permitted)

**Ambiguity:** The complete order status enumeration is implicit. Other statuses (SHIPPED, FULFILLED, FAILED, CANCELLED, RETURNED) are inferred but not formally documented. **This requires SME review for a formal state machine.**

---

## Summary Table

| Rule                              | Status    | Confidence | Notes                                               |
| --------------------------------- | --------- | ---------- | --------------------------------------------------- |
| Free shipping ≥$75                | Extracted | Medium     | Clear threshold, documented in code                 |
| Shipping formula $4.95+$0.75/item | Extracted | Low        | Bare literals; cost basis undocumented              |
| Cancellation (PENDING/APPROVED)   | Extracted | Medium     | Clear implementation; status enumeration incomplete |

## Related Capabilities

- **order-approval:** Approval thresholds are independent of fulfillment rules
- **card-acceptance:** Card validation is independent of fulfillment
- **refund-policy:** Refund eligibility (90-day window) is separate from cancellation eligibility

## Regulatory Context

- **SOX:** Order fulfillment and cancellation rules may fall under internal controls for revenue recognition
- **Operational:** Fulfillment SLAs and cancellation policy affect customer service liability
- **Financial:** Shipping cost structure affects order profitability and margin targets

## Open Items for SME Review

1. **Shipping Rate Justification:** Document the cost basis for $4.95 flat rate and $0.75 per-item rate
2. **Rate Review Cycle:** How often (if ever) are shipping rates reviewed and adjusted?
3. **Order Status Enumeration:** Formally document all valid order statuses and state transitions
4. **Fulfillment Trigger:** What explicit action or system event transitions an order from APPROVED to SHIPPED?
5. **Cancellation Customer Service:** Are there exceptions to the PENDING/APPROVED rule for customer service situations?
