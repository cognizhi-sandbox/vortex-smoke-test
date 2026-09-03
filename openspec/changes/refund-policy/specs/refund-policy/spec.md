# Refund Policy Specification

## Overview

The refund policy capability defines the temporal eligibility window for transaction refunds based on settlement age.

**Extracted from:** Pet Store Legacy Application (legacy-source/modules/billing/)  
**Confidence:** Medium (1 rule, no ambiguities)  
**Risk Class:** Financial (chargeback liability, customer trust, regulatory compliance)

## Rules

### Rule 1: 90-Day Refund Window

**Requirement:** The system SHALL permit refunds for transactions that were settled within the last 90 days. Transactions settled more than 90 days ago SHALL NOT be refundable.

GIVEN a transaction settled N days ago where N ≤ 90, THEN refund SHALL be permitted.  
GIVEN a transaction settled N days ago where N > 90, THEN refund SHALL NOT be permitted.

**Confidence:** Medium

**Trace:** `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java:17-19`

**Implementation:**

```java
/** Refunds are permitted for 90 days after settlement. */
public boolean canRefund(int daysSinceSettlement) {
    return daysSinceSettlement <= 90;
}
```

**Rationale:** The 90-day window balances customer protection (allowing reasonable refund requests) with fraud risk mitigation and payment processor constraints. Most payment processors (Visa, Mastercard) enforce similar windows, and most consumer protection regulations allow merchants to set refund windows within this range.

**Edge Cases:**

- Day 0 (same-day settlement) → Refund permitted
- Day 1 → Refund permitted
- Day 89 → Refund permitted
- Day 90 (boundary) → Refund permitted (inclusive)
- Day 91 → Refund NOT permitted
- Day 180 → Refund NOT permitted
- Negative days (future settlement) → Implementation-dependent; should be rejected upstream

**Boundary Condition:** Transactions on the 90th day are still refundable. The comparison uses inclusive boundary: `daysSinceSettlement <= 90`.

**Implicit Assumptions:**

- "Settlement" is a defined point in time (authorization, capture, clearing, or other — see ambiguities)
- "Days since settlement" is calculated as an integer count of elapsed days
- Current date/time reference point is system-defined
- No partial refunds or multi-step refund processing affects the 90-day eligibility

---

## Summary Table

| Rule                 | Status    | Confidence | Notes                                                 |
| -------------------- | --------- | ---------- | ----------------------------------------------------- |
| 90-day refund window | Extracted | Medium     | Clearly documented; no ambiguities on value or intent |

## Related Capabilities

- **card-acceptance:** Card brand and expiry validation is independent of refund eligibility
- **order-approval:** Order approval thresholds are independent of refund policy
- **order-fulfillment:** Fulfillment status is independent of refund eligibility (though operationally related)

## Regulatory Context

- **Consumer Protection:** Most US states allow merchants to set refund windows; 90 days is a common industry standard
- **Payment Processors:** Visa, Mastercard and other networks have guidelines on refund timeframes; 90 days is typically within compliance
- **PCI DSS:** Refund policy affects fraud prevention and chargeback handling
- **SOX:** Refund eligibility may fall under internal controls for revenue recognition and warranty reserves

## Open Items for SME Review

1. **Settlement Date Definition:** Clarify whether "settlement" refers to authorization, capture, or clearing date
2. **Days Calculation Method:** Document whether "days elapsed" is calendar days, business days, or 24-hour periods
3. **Timezone Handling:** Specify how current date/time is determined for day-count calculation
4. **Regulatory Compliance:** Confirm 90-day window complies with applicable state/federal consumer protection laws
5. **Payment Processor Constraints:** Verify alignment with Visa/Mastercard refund window requirements
6. **Partial Refunds:** Clarify whether partial refunds have different eligibility rules
7. **Refund Completion Time:** Document expected time for refund to reach customer account (separate from eligibility window)
