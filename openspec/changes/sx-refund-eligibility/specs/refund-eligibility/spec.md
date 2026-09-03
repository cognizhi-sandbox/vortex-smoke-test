# Refund Eligibility Specification

**Version**: 1.0 | **Status**: EXTRACTED (SX-0003) | **Date**: 2026-09-03 | **Confidence**: HIGH | **Risk Class**: FINANCIAL

## Requirement

Refunds for settled payment transactions SHALL be permitted if the refund is requested within 90 days from the date of settlement.

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 17-19

**Logic**: `daysSinceSettlement <= 90 → refund eligible`

## Test Cases

- 0 days after settlement → Eligible
- 45 days after settlement → Eligible
- 90 days after settlement → Eligible
- 91 days after settlement → Not eligible

## Constraints

1. **Bare Literal**: No configuration or documented rationale for 90-day value
2. **Out of Scope**: Refund workflow, approval process, reversal handling
3. **Settlement Date**: Unclear if "settlement" means gateway settlement, merchant settlement, or transaction posting date
