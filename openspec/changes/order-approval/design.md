# Order Approval Technical Design

## Components

1. **Approval Validator** — determines if order requires manager approval
   - Standard threshold: $5,000
   - Platinum bypass: 2x threshold ($10,000)
   - Input: order total, customer tier

2. **Shipping Calculator** — computes shipping cost
   - Free for orders ≥$75
   - $4.95 flat + $0.75/item for orders <$75
   - Input: order total, item count

3. **Cancellation Checker** — validates order can be cancelled
   - Cancellable: PENDING, APPROVED
   - Not cancellable: all other statuses
   - Input: order status

## Implementation Notes

- All thresholds currently hardcoded
- No configuration mechanism exists
- Platinum multiplier is bare literal (2)
- Shipping rates are bare literals
