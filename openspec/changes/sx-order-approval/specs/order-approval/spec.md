# Order Approval Specification

**Version**: 1.0  
**Status**: EXTRACTED (SX-0003)  
**Date**: 2026-09-03  
**Source**: Legacy petstore OrderRules.java  
**Confidence**: HIGH  
**Risk Class**: FINANCIAL

## Overview

This specification defines order approval thresholds based on customer tier.

## Functional Requirements

### R1: Standard Customer Approval Threshold

**Requirement**: An order with a total amount of $5,000.00 or greater SHALL require manager approval before processing.

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 5-6, 15

**Logic**: `orderTotal >= 5000.00 → requires approval`

**Test Cases**:

- Order $4,999.99 → No approval required
- Order $5,000.00 → Approval required
- Order $10,000.00 → Approval required

---

### R2: Platinum Tier Exemption

**Requirement**: Platinum-tier customers SHALL be exempt from the order approval requirement for orders with totals up to $10,000.00. Orders exceeding $10,000.00 from Platinum customers SHALL require manager approval.

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 10-13

**Logic**:

```
IF customer.tier == "PLATINUM" THEN
  orderTotal >= 10000.00 → requires approval
ELSE
  orderTotal >= 5000.00 → requires approval
END IF
```

**Rationale**: 2x multiplier applied to base threshold for Platinum tier (reflects higher customer credit or relationship value).

**Test Cases**:

- Platinum customer, $9,999.99 → No approval required
- Platinum customer, $10,000.00 → Approval required
- Standard customer, $5,000.00 → Approval required

---

## Decision Table

| Customer Tier | Order Amount | Approval Required | Notes                |
| ------------- | ------------ | ----------------- | -------------------- |
| Standard      | < $5,000     | No                | Below threshold      |
| Standard      | ≥ $5,000     | Yes               | Meets threshold      |
| Platinum      | < $10,000    | No                | Below tier threshold |
| Platinum      | ≥ $10,000    | Yes               | Meets tier threshold |

---

## Constraints & Ambiguities

1. **Tier Assignment Mechanism**: How "PLATINUM" tier is assigned is not documented in this code. Database schema required.
2. **Thresholds Are Bare Literals**: No external configuration or documented rationale for $5,000 vs $10,000 values.
3. **Approval Workflow**: Not specified. Who approves? Timeout? Auto-approve after 24 hours?

---

## References

- **Source Code**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 5-15
- **Extracted Records**: `ORDER-APPROVAL-BASE-THRESHOLD-0001`, `ORDER-APPROVAL-PLATINUM-TIER-0001`

---

## Approval & Sign-Off

**Specification Review**: ✓ Completed (SX-0003)  
**Compliance Review**: ⧖ Pending  
**Business Review**: ⧖ Pending (rationale for thresholds)

---

**END OF SPECIFICATION**
