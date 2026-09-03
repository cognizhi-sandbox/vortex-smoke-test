# Refund Eligibility Tasks

1. **Clarify Settlement Date**: Define settlement date (gateway vs merchant vs posting) — 2h
2. **Implement Refund Check**: `isRefundEligible(daysSinceSettlement) → boolean` — 2h
3. **Externalize Configuration**: Move 90-day window to config — 1h
4. **Unit Tests**: Boundary tests (0, 45, 90, 91 days) — 2h
5. **Compliance Review**: Align with card association rules — 1h
6. **Deploy**: Push to production — 2h

**Total**: ~10 hours

**Timeline**: 1 week

**Team**: 2 engineers + compliance
