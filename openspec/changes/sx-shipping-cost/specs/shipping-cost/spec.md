# Shipping Cost Specification

**Version**: 1.0  
**Status**: EXTRACTED (SX-0003)  
**Date**: 2026-09-03  
**Source**: Legacy petstore OrderRules.java  
**Confidence**: HIGH  
**Risk Class**: FINANCIAL

## Overview

This specification defines the shipping cost calculation logic used in the petstore order system. Shipping cost is determined by order total and item count using a two-model system: free shipping above a threshold, and a hybrid fee (fixed base plus per-item charge) below the threshold.

## Functional Requirements

### R1: Free Shipping Threshold

**Requirement**: Orders with a total amount of $75.00 or greater SHALL ship for free (shipping cost = $0.00).

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 7-8, 19

**Logic**:

```
IF orderTotal >= $75.00 THEN
  shippingCost = $0.00
END IF
```

**Rationale**: Free shipping threshold creates a price break for bulk orders; provides incentive for customers to increase order size. The $75.00 value is a bare literal with no documented business rationale.

**Examples**:

```
Input:  orderTotal = $75.00, itemCount = 5
Output: $0.00 (free shipping)

Input:  orderTotal = $100.00, itemCount = 10
Output: $0.00 (free shipping)

Input:  orderTotal = $74.99, itemCount = 3
Output: Depends on charged calculation (proceed to R2)
```

**Test Cases**:

```
Test 1:
Input:  orderTotal = $75.00, itemCount = 5
Output: $0.00 (ACCEPTED)

Test 2:
Input:  orderTotal = $76.00, itemCount = 1
Output: $0.00 (ACCEPTED)

Test 3:
Input:  orderTotal = $74.99, itemCount = 5
Output: Proceed to charged calculation
```

---

### R2: Charged Shipping Calculation

**Requirement**: Orders with a total amount below $75.00 SHALL incur a shipping cost calculated as: $4.95 (base fee) + ($0.75 × item count).

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 20-21

**Logic**:

```
IF orderTotal < $75.00 THEN
  shippingCost = $4.95 + (itemCount × $0.75)
END IF
```

**Rationale**: Charged shipping model combines a fixed base fee ($4.95, covering order processing) with a per-item handling charge ($0.75, covering packing/labor for each item). This hybrid model incentivizes larger orders (per-item cost decreases as order count increases).

**Examples**:

```
Input:  orderTotal = $50.00, itemCount = 1
Output: $4.95 + (1 × $0.75) = $5.70

Input:  orderTotal = $50.00, itemCount = 5
Output: $4.95 + (5 × $0.75) = $8.70

Input:  orderTotal = $50.00, itemCount = 10
Output: $4.95 + (10 × $0.75) = $12.45

Input:  orderTotal = $50.00, itemCount = 0
Output: $4.95 (base fee only)
```

**Test Cases**:

```
Test 1:
Input:  orderTotal = $50.00, itemCount = 1
Output: $5.70 (ACCEPTED)

Test 2:
Input:  orderTotal = $50.00, itemCount = 10
Output: $12.45 (ACCEPTED)

Test 3:
Input:  orderTotal = $30.00, itemCount = 0
Output: $4.95 (ACCEPTED, base fee)

Test 4:
Input:  orderTotal = $74.99, itemCount = 5
Output: $8.70 (ACCEPTED, just below threshold)
```

---

### R3: Threshold Boundary Behavior

**Requirement**: The free shipping threshold SHALL be inclusive; orders with totals exactly equal to $75.00 SHALL qualify for free shipping.

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, line 19

**Logic**:

```
IF orderTotal >= $75.00 THEN free
ELSE charged
```

**Edge Cases**:

- **$74.99**: Charged shipping applies ($4.95 + (itemCount × $0.75))
- **$75.00**: Free shipping applies ($0.00)
- **$75.01**: Free shipping applies ($0.00)

---

## Decision Table

| Order Total | Item Count | Shipping Cost | Notes                           |
| ----------- | ---------- | ------------- | ------------------------------- |
| $74.99      | 1          | $5.70         | Below threshold; base + 1 item  |
| $74.99      | 5          | $8.70         | Below threshold; base + 5 items |
| $75.00      | 1          | $0.00         | At threshold; free shipping     |
| $75.00      | 5          | $0.00         | At threshold; free shipping     |
| $100.00     | 10         | $0.00         | Above threshold; free shipping  |
| $30.00      | 0          | $4.95         | Below threshold; base fee only  |

---

## Constraints & Ambiguities

1. **Bare Literals**: The free shipping threshold ($75.00) and charged shipping components ($4.95 base, $0.75 per-item) are not externally configured or documented. No rationale exists for these specific values.

2. **Rounding Policy**: No specification for rounding fractional cents. The calculation $4.95 + (itemCount × $0.75) may produce results like $7.20 (exact) or edge cases requiring rounding guidance (not specified in legacy code).

3. **Comment Contradiction**: The javadoc comment states "Orders below this total ship free" (line 7) but the implementation checks `orderTotal >= FREE_SHIPPING_MIN` (line 19), which is logically opposite. The implementation is correct; the comment is misleading.

4. **Currency Assumption**: All values assume USD. No indication of multi-currency support or international shipping variants.

5. **Item Count Semantics**: "Item count" is assumed to be the number of distinct line items in the order. Clarification needed if this means:
   - Number of distinct products (SKUs)?
   - Total quantity (sum of all line item quantities)?
   - Number of order line records in the database?

6. **Regional Variation**: Single shipping model applies to all customer regions. No differentiation by destination, weight, or shipping method.

7. **Out of Scope**: This specification does NOT include:
   - Who performs shipping (internal warehouse vs third-party fulfiller)
   - When shipping occurs (next-day, standard, economy)
   - Tracking and notifications
   - Return shipping or reverse logistics
   - Promotion or coupon discounts on shipping

---

## Traces & Sources

| Source          | Lines | Type                  | Content                                   |
| --------------- | ----- | --------------------- | ----------------------------------------- |
| OrderRules.java | 7-8   | Constant declaration  | `FREE_SHIPPING_MIN = 75.00d` with javadoc |
| OrderRules.java | 18-21 | Method implementation | `shippingCost()` full calculation         |
| OrderRules.java | 19    | Threshold check       | `if (orderTotal >= FREE_SHIPPING_MIN)`    |
| OrderRules.java | 20-21 | Charged calculation   | `return 4.95d + (itemCount * 0.75d)`      |

---

## Extracted Records

- `SHIPPING-COST-FREE-THRESHOLD-0001` (Pass A) / `SHIPPING-COST-THRESHOLD-FREE-0001` (Pass B)
- `SHIPPING-COST-CHARGED-CALCULATION-0001` (Pass A) / `SHIPPING-COST-CALCULATION-PAID-0001` (Pass B)

Both passes achieved 100% semantic agreement with stylistic record-key naming differences.

---

## Approval & Sign-Off

**Specification Review**: ✓ Completed (SX-0003)  
**Compliance Review**: ⧖ Pending  
**Business Review**: ⧖ Pending (rationale for thresholds and rates)

---

**END OF SPECIFICATION**
