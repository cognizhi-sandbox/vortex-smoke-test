# Order Approval Specification

**Version**: 1.0  
**Status**: EXTRACTED (SX-0003)  
**Date**: 2026-09-03  
**Source**: Legacy petstore OrderRules.java  
**Confidence**: HIGH  
**Risk Class**: FINANCIAL

---

## ADDED Requirements

### Requirement: R1: Standard Customer Approval Threshold

An order with a total amount of $5,000.00 or greater SHALL require manager approval before processing.

#### Scenario: Order at standard threshold requires approval

**Given** a standard-tier customer with order total $5,000.00  
**When** order approval is checked  
**Then** the order SHALL require approval

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 5-6, 15

**Logic**:

```
IF orderTotal >= $5,000.00 THEN
  requires_approval = true
END IF
```

#### Scenario: Order below standard threshold does not require approval

**Given** a standard-tier customer with order total $4,999.99  
**When** order approval is checked  
**Then** the order SHALL NOT require approval

### Requirement: R2: Platinum Tier Exemption

Platinum-tier customers SHALL be exempt from the order approval requirement for orders with totals up to $10,000.00. Orders exceeding $10,000.00 from Platinum customers SHALL require manager approval.

#### Scenario: Platinum customer below exemption threshold

**Given** a Platinum-tier customer with order total $9,999.99  
**When** order approval is checked  
**Then** the order SHALL NOT require approval

**Source**: `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 10-13

**Logic**:

```
IF customerTier == "PLATINUM" THEN
  IF orderTotal >= $10,000.00 THEN
    requires_approval = true
  ELSE
    requires_approval = false
  END IF
END IF
```

#### Scenario: Platinum customer at exemption threshold

**Given** a Platinum-tier customer with order total $10,000.00  
**When** order approval is checked  
**Then** the order SHALL require approval

#### Scenario: Standard customer at standard threshold

**Given** a standard-tier customer with order total $5,000.00  
**When** order approval is checked  
**Then** the order SHALL require approval

---

## Test Cases

| Tier     | Amount     | Requires Approval | Notes                    |
| -------- | ---------- | ----------------- | ------------------------ |
| Standard | $4,999.99  | No                | Below threshold          |
| Standard | $5,000.00  | Yes               | At threshold             |
| Standard | $10,000.00 | Yes               | Well above threshold     |
| Platinum | $9,999.99  | No                | Below Platinum threshold |
| Platinum | $10,000.00 | Yes               | At Platinum threshold    |
| Platinum | $50,000.00 | Yes               | High amount, Platinum    |

---

## Key Decisions

- **Two-tier model**: Standard $5,000 threshold; Platinum $10,000 (2x multiplier)
- **Bare literals**: Thresholds hardcoded with no documented rationale
- **Tier assignment**: Mechanism not visible in this code

---

## Source Traceability

**Legacy Source** (`legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java`, lines 5-6, 10-15):

```java
private static final double APPROVAL_THRESHOLD = 5000.00d;

public boolean requiresApproval(double orderTotal, String customerTier) {
  if ("PLATINUM".equals(customerTier)) {
    return orderTotal >= (APPROVAL_THRESHOLD * 2);
  }
  return orderTotal >= APPROVAL_THRESHOLD;
}
```

**Extracted Records**:

- `ORDER-APPROVAL-BASE-THRESHOLD-0001`: Standard tier
- `ORDER-APPROVAL-PLATINUM-TIER-0001`: Platinum exemption

**Confidence**: HIGH  
**Extraction**: SX-0003 (2026-09-03)

---

**END OF SPECIFICATION**
