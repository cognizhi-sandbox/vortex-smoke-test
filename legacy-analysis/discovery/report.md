# Legacy Application Discovery Report

## SX-0002 Spec Extraction — Stage 1

**Date:** 2026-09-03  
**Application:** Pet Store Legacy System  
**Stack:** J2EE (Java, Oracle DB, Web Tier)  
**Total LOC:** 62 lines  
**Modules Identified:** 4  
**Capabilities:** 5

---

## Executive Summary

This is a compact J2EE application with concentrated business logic in two high-risk modules (orders and billing). The application enforces order approval thresholds, shipping calculations, card validation, and refund policies. No dead code detected; all modules are reachable and in active use.

**Risk Profile:** Two critical-path modules (orders, billing) represent 49 of 62 total lines. Extraction should prioritize order-approval and card-acceptance capabilities first, given regulatory and financial impact.

---

## Module Inventory

### High-Risk Modules

#### `modules/orders` — 28 LOC

**Business Area:** Order lifecycle management and approval  
**Risk Score:** 9/10

**Key Responsibilities:**

- Order approval threshold enforcement (orders ≥ $5,000 require manager approval)
- Tier-based bypass logic (Platinum customers may approve up to $10,000)
- Free shipping eligibility (orders ≥ $75)
- Shipping cost calculation (flat $4.95 + $0.75 per item when not free)
- Order cancellation eligibility (only PENDING or APPROVED orders may be cancelled)

**Regulatory Impact:** Financial thresholds; approval rules affect audit trails and authorization matrices.

**Files:**

- `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java` (lines 1-28)

**Dependencies:**

- `modules/billing` — for payment processing validation
- `conf/integration.properties` — external configuration (if needed)

**Trace References:**

- Approval threshold: `OrderRules.java:6` (APPROVAL_THRESHOLD = 5000.00)
- Platinum bypass: `OrderRules.java:11-13` (tier-based conditional, 2x threshold)
- Free shipping: `OrderRules.java:8` (FREE_SHIPPING_MIN = 75.00)
- Shipping formula: `OrderRules.java:21` (4.95 + itemCount \* 0.75)
- Cancellation rule: `OrderRules.java:24-26` (status-based check)

---

#### `modules/billing` — 21 LOC

**Business Area:** Payment processing and refund eligibility  
**Risk Score:** 9/10

**Key Responsibilities:**

- Card brand acceptance (Visa and Mastercard only; Amex dropped in 2003)
- Card expiry validation (month and year comparison)
- Minimum card length enforcement (13 digits)
- Refund eligibility (permitted for up to 90 days post-settlement)

**Regulatory Impact:** Payment Card Industry (PCI) compliance; card brand restrictions; refund policy affects liability and customer service rules.

**Files:**

- `legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java` (lines 1-21)

**Dependencies:**

- `conf/integration.properties` — payment gateway configuration (URL, API key, timeout)

**Trace References:**

- Accepted brands: `CreditCardValidator.java:5-9` (Visa '4', Mastercard '5' only)
- Card length minimum: `CreditCardValidator.java:6` (< 13 rejected)
- Expiry logic: `CreditCardValidator.java:12-14` (year/month comparison, inclusive boundary on equals)
- Refund window: `CreditCardValidator.java:17-19` (90-day rule)
- Historical note: `CreditCardValidator.java:8` (Amex dropped 2003)

---

### Low-Risk Modules

#### `web` — 6 LOC

**Business Area:** Web tier configuration  
**Risk Score:** 2/10

**Key Responsibilities:**

- Authentication method specification (FORM-based login)
- Session timeout configuration (30 minutes)

**Files:**

- `legacy-source/web/WEB-INF/web.xml` (lines 1-6)

**Dependencies:** None (configuration-only)

**Rationale for Low Score:** Standard servlet container configuration; no business logic. Changes are operational, not business-critical.

---

#### `conf` — 7 LOC

**Business Area:** External integration configuration  
**Risk Score:** 1/10

**Key Responsibilities:**

- Database connection pooling (Oracle, max 25 connections)
- Payment gateway endpoint and credentials

**Files:**

- `legacy-source/conf/jdbc.properties` (lines 1-4)
- `legacy-source/conf/integration.properties` (lines 1-3)

**Dependencies:** None (configuration-only)

**Secrets Detected:** 2 redacted entries (JDBC password, payment gateway API key)

**Rationale for Low Score:** Pure operational configuration; no business rules. Sensitive values require separate handling.

---

## Dependency Structure

```
[conf] ← [web]
         ├── [modules/orders]
         │   └── [modules/billing]
         └── [modules/billing]
```

**Flow:**

1. Web tier routes requests to modules
2. Orders module may invoke billing module for payment validation
3. Both modules read external configuration (database, gateway)

**Circular Dependencies:** None detected.

**Dependency Maturity:** Low, stable. Each dependency is explicit and unidirectional.

---

## Capabilities Breakdown

| Capability         | Module          | Risk | LOC | Notes                                 |
| ------------------ | --------------- | ---- | --- | ------------------------------------- |
| order-approval     | modules/orders  | High | 6   | Thresholds and tier bypasses          |
| order-fulfillment  | modules/orders  | High | 10  | Shipping costs and cancellation rules |
| card-acceptance    | modules/billing | High | 8   | Brand validation, expiry checking     |
| refund-policy      | modules/billing | High | 4   | 90-day post-settlement window         |
| session-management | web             | Low  | 6   | Auth method and timeout config        |

**Capability Concentration:** Order and billing logic are highly concentrated (49 LOC across 2 modules). Extraction order should follow financial criticality: order-approval → card-acceptance → refund-policy → order-fulfillment → session-management.

---

## Exclusions Summary

### Files Excluded (Rationale)

None. The legacy source tree is compact and complete; all files contribute to the specification.

### Code Paths Excluded (Rationale)

**Configuration files (web.xml, \*.properties):**

- Web.xml: Session timeout (30 min) is operational config, not a business rule. Excluded from requirements, noted as context.
- integration.properties: API timeout (8000 ms) is operational. Payment gateway URL and credentials are integration artifacts, not rules.
- jdbc.properties: Connection pooling (max 25) is operational tuning, not a business rule.

**None of these encode decision logic; they are deployment parameters.**

### Unreachable Code

None detected. All classes are small, single-responsibility, and reachable from the web tier.

### Technology Stack Notes

- **Framework:** Servlet-based (no Struts/JSF/Spring identified in this snapshot)
- **Database:** Oracle (JDBC connection string in config)
- **Authentication:** FORM-based (web.xml)
- **Integration:** REST payment gateway (inferred from timeout and API key)
- **No JSP/Scriptlets:** Unlike many J2EE applications, this tree contains only declarative Java classes; no embedded business logic in JSPs.

---

## Risk Assessment Rationale

### Why modules/orders and modules/billing are "high" (9/10)

1. **Financial Impact:** Order approval thresholds directly affect company revenue and audit liability. Card acceptance and refund rules directly affect transaction success and customer disputes.

2. **Regulatory Exposure:**
   - Approval thresholds fall under authorization matrices (SOX, internal controls).
   - Card brand restrictions and expiry rules are PCI DSS requirements.
   - Refund eligibility is statutory/contractual.

3. **Hidden Constants:** Multiple bare literals with no accompanying configuration or test:
   - `APPROVAL_THRESHOLD = 5000.00` — no documented justification or review date
   - `FREE_SHIPPING_MIN = 75.00` — no business case
   - Refund window `90 days` — no justification
   - Platinum multiplier `2x` — high-impact rule, single source

4. **Implicit Rules:** The ordering of expiry checks (year first, then month) is implicit in the conditional logic; a naive port could reverse the order.

5. **Edge Cases:** Order cancellation rule separates PENDING and APPROVED as cancellable; all other statuses reject cancellation silently with no indication whether FAILED, SHIPPED, RETURNED, etc. are distinct states.

### Why web and conf are "low" (2/10, 1/10)

- Pure configuration: no decision logic, no state machines.
- Operational tuning: deployment decisions, not business rules.
- No cross-cutting behavior: isolation is high.

---

## Key Findings

### Discovery Phase Outputs

✓ **risk-scores.csv** — 4 modules ranked by risk (9, 9, 2, 1)  
✓ **capabilities.csv** — 5 coherent business capabilities  
✓ **dependency-graph.json** — Acyclic, 4 nodes, 6 edges  
✓ **report.md** — This document

### Recommendations for Extraction Phase

1. **Priority 1: Order Approval** (`order-approval`, `order-fulfillment`)
   - Extract requirements for APPROVAL_THRESHOLD and tier-based bypass.
   - Clarify whether platinum 2x multiplier extends to all tiers or only platinum.
   - Confirm free shipping threshold ($75) and whether it applies per-order or per-line-item.

2. **Priority 2: Card & Refund Logic** (`card-acceptance`, `refund-policy`)
   - Extract card brand acceptance and expiry rules as they are.
   - Investigate why Amex was dropped (contract, fraud, PCI, market).
   - Clarify settlement logic: is 90 days calendar or business days? Inclusive or exclusive boundary?

3. **Priority 3: Operational Config** (`session-management`)
   - Document session timeout (30 min) and auth method (FORM) as context.
   - Note external configuration (database, payment gateway) as integration concerns, not business rules.

### Technical Debt Observations

- No test coverage visible in this snapshot; recommend adding unit tests for threshold logic and expiry boundary conditions.
- Hard-coded thresholds and multipliers should move to configuration tables (or remain as constants with explicit review/change process).
- Order status enumeration is implicit (PENDING, APPROVED, inferred FAILED, SHIPPED, etc.); should be documented.

---

## Files Written

- `legacy-analysis/discovery/risk-scores.csv` — 4 modules × 5 columns
- `legacy-analysis/discovery/capabilities.csv` — 5 capabilities × 3 columns
- `legacy-analysis/discovery/dependency-graph.json` — 4 nodes, 6 edges
- `legacy-analysis/discovery/report.md` — This document (this file)

**Total records emitted:** 0 (discovery phase does not emit requirements; extraction phase follows)

**Findings raised:** 0 (no blockers or ambiguities requiring human resolution at this stage)

---

## Next Steps

Extraction phase will use this discovery output to:

1. Decompose each high-risk module by capability.
2. Extract requirements from each capability, traced to source lines.
3. Validate requirement coherence across passes.
4. Produce OpenSpec change set.
