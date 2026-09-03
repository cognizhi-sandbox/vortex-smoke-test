# Shipping Cost Specification

**Version**: 1.0 | **Status**: EXTRACTED (SX-0003) | **Date**: 2026-09-03 | **Confidence**: HIGH | **Risk Class**: FINANCIAL

---

## ADDED Requirements

### Requirement: R1: Free Shipping Threshold

Orders with a total amount of $75.00 or greater SHALL ship for free (shipping cost = $0.00).

#### Scenario: Order at free shipping threshold

**Given** an order with total $75.00  
**When** shipping cost is calculated  
**Then** the shipping cost SHALL be $0.00

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 7-8, 19

**Logic**:

```
IF orderTotal >= $75.00 THEN
  shippingCost = $0.00
END IF
```

#### Scenario: Order below free shipping threshold

**Given** an order with total $74.99  
**When** shipping cost is calculated  
**Then** the shipping cost SHALL be calculated with base + per-item charges

### Requirement: R2: Charged Shipping Calculation

Orders with totals below $75.00 SHALL incur a shipping cost of $4.95 (base fee) + ($0.75 × item count).

#### Scenario: Order charged shipping

**Given** an order with total $50.00 and 5 items  
**When** shipping cost is calculated  
**Then** the shipping cost SHALL be $8.70 ($4.95 + (5 × $0.75))

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 20-21

**Logic**:

```
IF orderTotal < $75.00 THEN
  shippingCost = $4.95 + (itemCount × $0.75)
END IF
```

#### Scenario: Order with zero items

**Given** an order with total $50.00 and 0 items  
**When** shipping cost is calculated  
**Then** the shipping cost SHALL be $4.95 (base fee only)

---

## Test Cases

| Order Total | Items | Expected Cost | Notes                        |
| ----------- | ----- | ------------- | ---------------------------- |
| $74.99      | 1     | $5.70         | Below threshold              |
| $75.00      | 1     | $0.00         | At threshold (free)          |
| $100.00     | 10    | $0.00         | Well above (free)            |
| $50.00      | 5     | $8.70         | Charged: $4.95 + (5 × $0.75) |
| $50.00      | 0     | $4.95         | Base fee only                |

---

## Key Decisions

- **Threshold**: $75.00 bare literal; no documented rationale
- **Charged model**: $4.95 base + $0.75 per-item (no documented rationale)
- **Rounding**: Undefined for fractional cents

---

## Source Traceability

**Extracted Records**:

- `SHIPPING-COST-FREE-THRESHOLD-0001`
- `SHIPPING-COST-CHARGED-CALCULATION-0001`

**Confidence**: HIGH  
**Extraction**: SX-0003 (2026-09-03)

---

**END OF SPECIFICATION**
