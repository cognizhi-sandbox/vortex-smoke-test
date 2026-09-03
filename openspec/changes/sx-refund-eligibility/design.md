# Refund Eligibility Design

**Check**: `daysSinceSettlement <= 90 → eligible`

**Gaps**: Settlement date definition; reversal workflow; chargeback period (120+ days typical).

**Config**: Externalize 90-day window to configuration.

**Testing**: Unit tests for day boundaries (0, 45, 90, 91); regression vs legacy.
