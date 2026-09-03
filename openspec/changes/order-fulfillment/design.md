# Order Fulfillment Technical Design

## Components

1. **Shipping Calculator** — computes shipping cost
   - Free for orders ≥$75
   - $4.95 flat + $0.75/item for orders <$75
   - Input: order total, item count

2. **Cancellation Checker** — validates order can be cancelled
   - Cancellable: PENDING, APPROVED
   - Not cancellable: all other statuses
   - Input: order status

## Data Flow

1. **Input:** Order object (total, item count, status)
2. **Processing:**
   - Shipping Calculator evaluates total against $75 threshold
   - Cancellation Checker evaluates status against allowed values
3. **Output:** Shipping cost (decimal) and cancellation eligibility (boolean)

## Implementation Notes

### Shipping Calculation

The shipping cost logic has two paths:

- If order total ≥ $75 → shipping = $0
- If order total < $75 → shipping = $4.95 + (itemCount × $0.75)

The flat rate ($4.95) and per-item rate ($0.75) are currently hardcoded constants with no configuration mechanism. No documentation explains their cost basis or review cycle.

### Cancellation Eligibility

Only orders with status `PENDING` or `APPROVED` may be cancelled. The order status enumeration is implicit in the code; other valid statuses (e.g., SHIPPED, FULFILLED, FAILED) are inferred but not formally declared.

## Configuration

All thresholds and rates are currently hardcoded:

- Free shipping threshold: $75
- Flat rate: $4.95
- Per-item rate: $0.75

Future versions should move these to configuration if business rules change.

## Testing Strategy

1. **Unit tests** for shipping calculator (threshold crossing, formula correctness)
2. **Unit tests** for cancellation checker (status validation)
3. **E2E tests** for fulfillment flow (order creation → shipping calculation → cancellation attempt)
