# Order Approval — Design

## Architecture

Order approval is a tiered control enforced during order processing. Two thresholds apply:

- **Base Threshold**: $5,000 for all customers
- **Platinum Threshold**: $10,000 for Platinum-tier customers

## Legacy Implementation

```java
public boolean requiresApproval(double orderTotal, String customerTier) {
  if ("PLATINUM".equals(customerTier)) {
    return orderTotal >= (APPROVAL_THRESHOLD * 2);  // $10,000
  }
  return orderTotal >= APPROVAL_THRESHOLD;  // $5,000
}
```

## Approval Workflow (Out of Scope)

This specification does NOT cover:

- Who performs approval (manager, supervisor, etc.)
- Time limits (SLA for approval)
- Auto-escalation
- Denial handling
- Audit trail

These are separate concerns requiring a workflow specification.

## Configuration Model

**Current**: Hardcoded constants

```
APPROVAL_THRESHOLD = 5000.00d
Platinum multiplier = 2x (implicit)
```

**Recommended**: External configuration

```yaml
order_approval:
  thresholds:
    standard: 5000.00
    platinum: 10000.00
```

## Implementation Patterns

### Guard Clause (Recommended)

```pseudocode
IF orderTotal < THRESHOLD(customerTier) THEN
  RETURN false (no approval needed)
ELSE
  RETURN true (approval required)
END IF
```

### Configuration-Based (Future-Proof)

```pseudocode
FUNCTION requiresApproval(orderTotal, tier, config):
  threshold = config.getThreshold(tier)
  RETURN orderTotal >= threshold
```

## Testing Strategy

| Scenario       | Amount  | Tier     | Expected    |
| -------------- | ------- | -------- | ----------- |
| Below standard | $4,999  | Standard | No approval |
| At standard    | $5,000  | Standard | Approval    |
| Below platinum | $9,999  | Platinum | No approval |
| At platinum    | $10,000 | Platinum | Approval    |
| High amount    | $50,000 | Platinum | Approval    |

## Known Gaps

1. **Tier Assignment**: How PLATINUM tier is assigned (database schema, rules) undefined
2. **Tier Persistence**: Whether tier can change mid-order
3. **Multi-Currency**: All examples in USD; handling of other currencies undefined
4. **Workflow Integration**: Not addressed in this spec
5. **Audit**: Who approved, when, and why not specified

## References

- **Source**: OrderRules.java lines 5-15
- **Related Specs**: Order Cancellation, Shipping Cost (both in same module)
