# Order Approval Thresholds — Proposal

## Summary

This specification formalizes order approval thresholds: $5,000 for standard customers, $10,000 for Platinum tier.

## Problem

- **Not externally documented** — thresholds embedded as bare literals in code
- **Not configurable** — changes require code deployment
- **Rationale undocumented** — no explanation for specific values or Platinum 2x multiplier

## Proposed Specification

**R1**: Orders ≥ $5,000 require manager approval  
**R2**: Platinum customers exempt up to $10,000 (2x multiplier)

## Acceptance Criteria

1. Specification document with decision table and test cases
2. Traceability to legacy code (OrderRules.java, lines 5-15)
3. Design document identifies approval workflow gaps
4. Implementation tasks outline configuration externalization
5. Business review confirms threshold rationale

## Value

- **Clarity**: Thresholds and tier logic formally specified
- **Auditability**: Paper trail for financial controls
- **Flexibility**: Configuration-based changes without deployment
- **Compliance**: Documented approval workflow

## Risks

- Tier assignment mechanism undefined
- $5,000 / $10,000 are bare literals with no documented basis
- Approval workflow (who, how long, auto-escalation) not defined in this spec
