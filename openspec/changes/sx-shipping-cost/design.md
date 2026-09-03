# Shipping Cost Design

## Architecture

Shipping cost calculation is a deterministic function based on order total and item count:

```
shippingCost(orderTotal: double, itemCount: int) → double
```

### Two-Model System

**Model 1: Free Shipping**

```
IF orderTotal >= $75.00
  THEN shippingCost = $0.00
```

**Model 2: Charged Shipping**

```
IF orderTotal < $75.00
  THEN shippingCost = $4.95 + (itemCount × $0.75)
```

## Legacy Implementation

```java
public double shippingCost(double orderTotal, int itemCount) {
    if (orderTotal >= FREE_SHIPPING_MIN) return 0.0d;
    // Flat rate plus a per-item handling charge.
    return 4.95d + (itemCount * 0.75d);
}
```

**Constants Used:**

- `FREE_SHIPPING_MIN = 75.00d`
- `BASE_SHIPPING_FEE = 4.95d` (implicit in return statement)
- `PER_ITEM_HANDLING_CHARGE = 0.75d` (implicit in return statement)

## Known Issues

1. **Comment Contradiction**: Javadoc states "Orders below this total ship free" but implementation checks `>=` for free shipping
2. **Bare Literals**: Constants $4.95 and $0.75 not defined as named constants (only the threshold is)
3. **Rounding Undefined**: No guidance on fractional cents (e.g., if itemCount \* $0.75 = $2.25)
4. **No Externalization**: All values hardcoded; no configuration file or database table

## Configuration Model

**Current State**: Hardcoded constants in OrderRules class

**Recommended State**: YAML or JSON configuration

```yaml
shipping:
  free_threshold: 75.00
  charged_model:
    base_fee: 4.95
    per_item_charge: 0.75
```

## Implementation Patterns

### Guard Clause (Recommended)

```pseudocode
FUNCTION shippingCost(orderTotal, itemCount, config):
  IF orderTotal >= config.freeThreshold THEN
    RETURN 0.0
  ELSE
    baseFee = config.baseFee
    perItemCharge = config.perItemCharge
    return baseFee + (itemCount * perItemCharge)
  END IF
```

### Configuration-Based (Future-Proof)

```pseudocode
FUNCTION shippingCost(orderTotal, itemCount, config):
  threshold = config.getThreshold("free_shipping")
  IF orderTotal >= threshold THEN
    RETURN 0.0
  ELSE
    baseFee = config.getRate("base_shipping_fee")
    perItemCharge = config.getRate("per_item_handling_charge")
    RETURN baseFee + (itemCount * perItemCharge)
  END IF
```

## Testing Strategy

| Scenario                           | Order Total | Item Count | Expected Result | Notes                |
| ---------------------------------- | ----------- | ---------- | --------------- | -------------------- |
| Free shipping (at threshold)       | $75.00      | 5          | $0.00           | Boundary case        |
| Free shipping (above)              | $100.00     | 10         | $0.00           | Well above threshold |
| Charged shipping (below threshold) | $50.00      | 1          | $5.70           | $4.95 + (1 × $0.75)  |
| Charged shipping (multiple items)  | $50.00      | 10         | $12.45          | $4.95 + (10 × $0.75) |
| Charged shipping (zero items)      | $50.00      | 0          | $4.95           | Base fee only        |
| Edge case (just below threshold)   | $74.99      | 5          | $8.70           | $4.95 + (5 × $0.75)  |

## Known Gaps

1. **Business Rationale**: Why $75.00 threshold and why $4.95/$0.75 rates? Not documented
2. **Rounding Rule**: How to handle fractional cents in the result (e.g., $4.95 + $2.25 = $7.20)
3. **Currency**: Assumed USD; no indication of multi-currency support
4. **Regional Variation**: Single model for all regions; no differentiation by destination
5. **Weight-Based**: No consideration for package weight; all orders charged uniformly per item
6. **Change Authority**: Who decides threshold and rate adjustments? No approval workflow documented
