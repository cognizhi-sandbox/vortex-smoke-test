# Refund Policy Technical Design

## Components

1. **Refund Eligibility Checker** — validates whether a transaction can be refunded
   - Input: days since settlement (integer)
   - Output: refund permitted (boolean)
   - Rule: permitted if daysSinceSettlement ≤ 90

## Data Flow

1. **Input:** Transaction object with settlement timestamp
2. **Processing:**
   - Calculate days elapsed since settlement
   - Compare against 90-day threshold
3. **Output:** Refund eligibility (boolean)

## Implementation Notes

### Refund Window

The refund window is **90 days from settlement date, inclusive**. A transaction settled exactly 90 days ago is still refundable. A transaction settled 91 days ago is non-refundable.

The method uses a simple integer comparison (`daysSinceSettlement <= 90`), where `daysSinceSettlement` is the number of calendar days between settlement date and current date.

### Settlement Date Definition

The rule references "days after settlement" but does not specify:

- Whether settlement is the transaction authorization date or the capture/clearing date
- How "days elapsed" is calculated (calendar days, business days, 24-hour periods)
- How the current date/time is determined (server time, UTC, customer timezone)

These details are implementation-specific and should be documented by the team adopting this specification.

## Testing Strategy

1. **Unit tests** for boundary conditions (day 89, 90, 91)
2. **E2E tests** for refund request flow with various settlement ages
