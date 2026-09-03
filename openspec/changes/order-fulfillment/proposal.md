# Order Fulfillment Specification Change

Extract and formalize order fulfillment and shipping rules from the legacy Pet Store application.

## Business Value

- **Operational:** Shipping cost rules directly affect order profitability and customer satisfaction
- **Financial:** Free shipping threshold ($75) is a key margin control lever
- **Customer:** Cancellation policy affects order management workflow and customer service recovery options

## Risk Class

**Operational** — Fulfillment rules affect order fulfillment SLAs, shipping cost liability, and customer cancellation rights.

## Scope

This change formalizes three requirements:

1. **Free shipping:** Orders ≥$75 ship free
2. **Shipping cost:** Orders <$75 cost $4.95 + ($0.75 × item count)
3. **Cancellation eligibility:** PENDING and APPROVED orders only

## Key Ambiguities

1. **Shipping rates ($4.95 flat, $0.75/item):** No cost basis documented; when were these rates set?
2. **Order status enumeration:** Implicit state machine; other statuses not formally enumerated
