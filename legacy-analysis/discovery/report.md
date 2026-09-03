# SX-0003 Discovery Report

## Application Overview

The legacy petstore application is a minimal J2EE system organized around two core business domains: **Orders** and **Billing**. The application manages order processing with approval workflows and payment processing with card validation rules.

**Total LOC (code modules):** ~49  
**Configuration files:** 2  
**Web configuration:** 1 minimal web.xml

## Module Inventory

### 1. `modules/orders` — Order Processing

**Location:** `legacy-source/modules/orders/src/com/petstore/orders/`

**Files:**

- `OrderRules.java` (28 lines)

**Functionality:**

- Order approval workflow with tiered thresholds
- Shipping cost calculation based on order total
- Order cancellation eligibility rules

**Key Rules Extracted:**

1. **Approval Threshold**: Orders ≥ $5,000 require manager approval
2. **Platinum Bypass**: Platinum customers bypass approval up to $10,000
3. **Free Shipping**: Orders ≥ $75 ship free
4. **Shipping Cost**: Flat $4.95 + $0.75 per item
5. **Cancellation**: Orders in PENDING or APPROVED status may be cancelled

**Risk Level:** HIGH

- Reason: Core financial workflow with monetary thresholds
- Confidence: High (rules are explicit in code)
- Estimated screens: 3 (order creation, approval queue, order management)

**Dependencies:**

- Externally: Likely called by order service/servlet layer (not present in tree)
- Internally: None

---

### 2. `modules/billing` — Card Processing & Validation

**Location:** `legacy-source/modules/billing/src/com/petstore/billing/`

**Files:**

- `CreditCardValidator.java` (21 lines)

**Functionality:**

- Credit card brand validation (Visa/Mastercard only)
- Card expiration checking
- Refund eligibility window enforcement

**Key Rules Extracted:**

1. **Accepted Brands**: Only Visa (4) and Mastercard (5); Amex dropped in 2003
2. **Minimum Length**: Card number must be ≥ 13 digits
3. **Expiry Logic**: Card expires at end of `expiryMonth` of `expiryYear`
4. **Refund Window**: Refunds permitted within 90 days of settlement

**Risk Level:** CRITICAL → HIGH

- Reason: Payment processing; regulatory and compliance implications
- Confidence: High (rules are explicit; inline comment provides historical context)
- Estimated screens: 2 (checkout/payment, refund management)
- **Note:** Card brand restrictions suggest legacy regulatory or partner constraints; Amex dropout suggests past business change

**Dependencies:**

- Externally: Likely called during payment authorization
- Internally: None

---

### 3. `conf` — Configuration

**Location:** `legacy-source/conf/`

**Files:**

- `jdbc.properties` (5 lines)
- `integration.properties` (3 lines)

**Configuration:**

- **JDBC**: Oracle database connectivity (legacy-db:1521, max pool 25)
- **Integration**: Payment gateway URL and API key, 8s timeout

**Risk Level:** MEDIUM

- Reason: Database and external service configuration; credentials storage
- Note: Current state shows redacted secrets; original properties contain sensitive values
- Estimated screens: 0 (infrastructure)

---

### 4. `web` — Web Container Configuration

**Location:** `legacy-source/web/WEB-INF/`

**Files:**

- `web.xml` (6 lines)

**Configuration:**

- FORM-based authentication
- 30-minute session timeout
- Display name: "Pet Store Legacy"

**Risk Level:** LOW

- Reason: Minimal configuration; no custom filters or constraints declared
- Estimated screens: 0 (infrastructure)

---

## Dependency Graph

### Module Dependencies

```
OrderRules
  ↓ (likely)
  [Order Service Layer - not in tree]

CreditCardValidator
  ↓ (likely)
  [Payment Service Layer - not in tree]

[Config (JDBC, Integration)]
  ↓ (used by)
  OrderRules, CreditCardValidator, Services
```

### External Dependencies

1. **Oracle Database** (via JDBC)
   - Configuration: `jdbc.properties`
   - Used by: Order and Billing services

2. **Payment Gateway** (via HTTP/REST)
   - Configuration: `integration.properties`
   - Used by: Billing service
   - Timeout: 8 seconds

---

## Risk Analysis Summary

| Module            | LOC | Screens | Risk   | Reasoning                                                                 |
| ----------------- | --- | ------- | ------ | ------------------------------------------------------------------------- |
| `modules/orders`  | 28  | 3       | HIGH   | Financial workflow; approval thresholds; tier-based logic                 |
| `modules/billing` | 21  | 2       | HIGH   | Payment processing; card validation; regulatory implications              |
| `conf`            | 8   | 0       | MEDIUM | External service & DB config; credentials; non-extractable business logic |
| `web`             | 6   | 0       | LOW    | Standard J2EE configuration; minimal complexity                           |

### Risk Factors

1. **Orders Module**
   - ✓ Explicit thresholds with no ambiguity
   - ✓ Business logic centralized in a single class
   - ⚠ Tier-based logic (PLATINUM bypass) requires careful mapping
   - ⚠ Shipping calculation has implicit ordering assumptions

2. **Billing Module**
   - ✓ Clear validation rules
   - ⚠ Historical context embedded (Amex dropped 2003) — suggests prior product changes
   - ⚠ Expiry logic subtlety: last day of month edge case
   - ⚠ 90-day refund window is a bare literal with no configuration

3. **Configuration**
   - ⚠ Secrets management via properties files (legacy anti-pattern)
   - ⚠ Database pool size hardcoded (max 25)
   - ⚠ No audit trail for configuration changes

---

## Exclusions & Gaps

### Not Present (Service Layer)

The extracted code files do **not** include:

- Order Service / Action classes
- Payment Service / processors
- Order/Payment repositories or DAOs
- Servlet/JSP entry points
- Struts configuration or form beans (if J2EE MVC layer exists)
- Validation configuration (if separate validation.xml exists)
- Database schema (DDL)

These would normally contain:

- Workflow orchestration
- Error handling
- Authorization enforcement
- API contracts
- Data access patterns

### Likely Affected Functionality (Out of Scope for SX-0003)

1. **Approval Workflow**
   - Order state machine (PENDING → APPROVED → FULFILLED)
   - Notification/escalation to managers
   - Approval UI and authorization checks

2. **Payment Processing**
   - Transaction recording and settlement
   - Decline handling
   - Retry logic for gateway timeouts

3. **Shipping & Fulfillment**
   - Carrier integration
   - Tracking
   - Partial shipment handling

---

## Confidence & Basis

### High Confidence (Explicit Rules)

- OrderRules thresholds: Direct literals in code
- CreditCardValidator brand check: First-digit logic
- Refund window: Direct literal (90 days)

### Medium Confidence (Inferred Context)

- PLATINUM tier behavior: Code logic is clear, but tier assignment mechanism is not in tree
- Free shipping threshold: Based on `if (orderTotal >= FREE_SHIPPING_MIN)`

### Low Confidence (Bare Literals & Ambiguities)

- Shipping flat rate ($4.95) and per-item fee ($0.75): No comment on rounding or why these exact values
- Session timeout (30 minutes): No statement of intent (user preference? security requirement?)
- Database pool max (25): No tuning or load justification

---

## Next Steps (Extraction Phase)

The following capabilities are ready for detailed requirement extraction:

1. ✓ Order approval rules (HIGH priority)
2. ✓ Card validation rules (HIGH priority)
3. ✓ Shipping cost calculation (MEDIUM priority)
4. ✓ Order cancellation rules (MEDIUM priority)
5. ✓ Refund eligibility rules (MEDIUM priority)

Missing from this tree (blockers for full extraction):

- Database schema (constraints, enums, audit tables)
- Service layer (error handling, state transitions)
- UI/JSP (conditional visibility, user-facing workflows)
- Batch/scheduled jobs (if any)
