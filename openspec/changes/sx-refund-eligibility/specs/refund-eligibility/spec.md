# Refund Eligibility Specification

**Version**: 1.0 | **Status**: EXTRACTED (SX-0003) | **Date**: 2026-09-03 | **Confidence**: HIGH | **Risk Class**: FINANCIAL

---

## ADDED Requirements

### Requirement: R1: 90-Day Refund Window

Refunds for settled payment transactions SHALL be permitted if the refund is requested within 90 days from the date of settlement.

#### Scenario: Refund within 90-day window is eligible

**Given** a payment settled 45 days ago  
**When** a refund is requested  
**Then** the refund SHALL be eligible

**Source**: `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java`, lines 17-19

**Logic**:

```
IF daysSinceSettlement <= 90 THEN
  refund_eligible = true
ELSE
  refund_eligible = false
END IF
```

#### Scenario: Refund at 90-day boundary is eligible

**Given** a payment settled exactly 90 days ago  
**When** a refund is requested  
**Then** the refund SHALL be eligible

#### Scenario: Refund beyond 90-day window is not eligible

**Given** a payment settled 91 days ago  
**When** a refund is requested  
**Then** the refund SHALL NOT be eligible

---

## Test Cases

| Days Since Settlement | Eligible | Notes         |
| --------------------- | -------- | ------------- |
| 0                     | Yes      | Same day      |
| 45                    | Yes      | Mid-window    |
| 90                    | Yes      | At boundary   |
| 91                    | No       | Beyond window |

---

## Key Decisions

- **Window**: 90-day bare literal; no documented rationale
- **Settlement date**: Undefined (gateway vs merchant vs posting)

---

## Source Traceability

**Extracted Record**: `REFUND-NINETY-DAY-WINDOW-0001`  
**Confidence**: HIGH  
**Extraction**: SX-0003 (2026-09-03)

---

**END OF SPECIFICATION**
