# Shipping Cost Proposal

## Problem Statement

The legacy petstore system applies two shipping cost models based on order total:

- **Free Shipping**: Orders totaling $75.00 or more ship for free
- **Charged Shipping**: Orders below $75.00 incur a hybrid fee: $4.95 base + $0.75 per item

These thresholds and cost components are bare literals with no documented business rationale, making the system difficult to maintain, audit, or adapt to future pricing changes.

## Business Value

1. **Clarity**: Formalizes shipping policy for customer-facing communication and compliance audits
2. **Configurability**: Enables seasonal adjustments or promotional pricing without code redeployment
3. **Traceability**: Establishes audit trail for revenue impact and margin analysis
4. **Compliance**: Documents decision points for financial and operational reviews

## Specification Summary

- Free shipping threshold: $75.00 (bare literal, undocumented)
- Charged shipping formula: $4.95 (base) + $0.75 × (item count)
- Rounding behavior: Undefined (not documented)
- Regional variation: Not supported (single model for all)

## Key Risks

1. **Threshold Value**: The $75.00 threshold lacks business rationale—unclear whether optimized for margin, competitiveness, or cost recovery
2. **Cost Components**: The $4.95 base and $0.75 per-item rates have no documented basis (actual cost, margin, competitive rate?)
3. **Rounding Policy**: No guidance on fractional cents in shipping cost calculations
4. **Revenue Impact**: Shipping cost model directly affects customer pricing; threshold changes have margin implications
5. **Undocumented Change History**: No indication of whether values have been adjusted or how frequently

## Out of Scope

- Multi-carrier selection or negotiation
- Regional or international shipping variants
- Weight-based or dimensional calculations
- Integration with third-party fulfillment providers
- Promotional shipping offers or coupon discounts

## Recommendation

Extract this business rule into externalized configuration with clear documentation of values, rationale, and change authority. Conduct business review to confirm threshold and rate values align with current strategy.
