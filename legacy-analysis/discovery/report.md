# Spec Extraction SX-0001: Legacy Petstore Discovery

## Executive Summary

The legacy application is a small J2EE-based petstore system with two core business logic modules (billing and orders) and minimal configuration infrastructure. The codebase is 62 lines across all source files, with no JSP/UI layer included in this extraction.

**Stage**: Discovery (requirements extraction not yet performed)  
**Status**: Analysis complete, partial codebase  
**Application Type**: J2EE web application (Struts/Spring era based on config patterns)

## Codebase Structure

```
legacy-source/
├── conf/                    # Configuration files (7 LOC)
│   ├── jdbc.properties      # Database connection settings
│   └── integration.properties # Payment gateway configuration
├── modules/                 # Business logic modules
│   ├── billing/            # Payment processing (21 LOC)
│   │   └── CreditCardValidator.java
│   └── orders/             # Order management rules (28 LOC)
│       └── OrderRules.java
└── web/                    # Web application layer (6 LOC)
    └── WEB-INF/
        └── web.xml         # Servlet configuration
```

## Module Inventory

### 1. modules/billing

**Purpose**: Credit card validation and refund eligibility  
**LOC**: 21  
**Files**: 1 Java class  
**Screens**: 0 (no UI in provided extraction)  
**Risk**: HIGH

**Responsibilities**:

- Card brand validation (Visa, Mastercard only; Amex dropped 2003)
- Expiry date validation
- Refund eligibility (90-day window)

**Findings**:

- Hard-coded card brand rules (Visa '4', Mastercard '5' prefixes)
- Hard-coded 90-day refund window
- No framework dependencies; pure domain logic
- Minimal field length validation (>= 13 chars for card number)

### 2. modules/orders

**Purpose**: Order acceptance and fulfillment rules  
**LOC**: 28  
**Files**: 1 Java class  
**Screens**: 0 (no UI in provided extraction)  
**Risk**: HIGH

**Responsibilities**:

- Order approval threshold enforcement
- Shipping cost calculation
- Order cancellation eligibility

**Findings**:

- Hard-coded approval threshold ($5,000)
- Platinum customer tier gets 2x threshold ($10,000 before approval)
- Free shipping on orders $75+
- Flat-rate shipping ($4.95) + per-item handling ($0.75/item)
- Orders can only be cancelled in PENDING or APPROVED status
- Status-based state machine (implicit; no enum provided)

### 3. conf (Configuration)

**Purpose**: Application deployment settings  
**LOC**: 7  
**Files**: 2 properties files  
**Screens**: 0  
**Risk**: MEDIUM

**Findings**:

- Oracle JDBC connection pool (max 25 connections)
- External payment gateway integration (8-second timeout)
- Secrets: database password, payment API key (both redacted in extraction)

### 4. web (Web Application)

**Purpose**: Servlet container configuration  
**LOC**: 6  
**Files**: 1 XML configuration  
**Screens**: 0  
**Risk**: LOW

**Findings**:

- FORM-based authentication
- 30-minute session timeout
- No JSPs or routing rules in provided extraction

## Dependency Analysis

**Direct Code Dependencies**: None detected

- No Java `import` statements across modules
- Billing and orders modules are standalone, self-contained validators
- Configuration files reference external systems (Oracle DB, payment gateway) not other modules

**Implicit Dependencies**:

- Orders module may call Billing module for card validation (inferred from business context, not in code)
- All modules depend on configuration layer for runtime settings

## Critical Business Rules Identified

### Card Validation

1. Only Visa (prefix '4') and Mastercard (prefix '5') accepted
2. Card number must be >= 13 characters
3. Amex dropped in 2003 (historical note)

### Order Rules

1. **Approval Threshold**: $5,000 standard, $10,000 for Platinum customers
2. **Shipping**: Free on $75+; otherwise $4.95 flat + $0.75 per item
3. **Cancellation**: Only allowed in PENDING or APPROVED status

### Refunds

1. **Window**: 90 days post-settlement
2. No other refund conditions present

## Risk Assessment Rationale

### HIGH RISK: modules/billing

- **Reason**: Directly processes sensitive payment data
- **Impact**: Incorrect card validation could allow fraudulent charges
- **Hardened**: Rules are enforced in code, not database; difficult to audit or override
- **Dependency**: Critical path for any order with payment

### HIGH RISK: modules/orders

- **Reason**: Defines critical business logic (approval thresholds, shipping costs, cancellation rules)
- **Impact**: Incorrectly calculated shipping or approval rules bypass could cause financial loss
- **Hardened**: Multiple hard-coded literals with no configuration or override mechanism
- **Dependency**: Required for order processing

### MEDIUM RISK: conf

- **Reason**: Contains secrets and external integration configuration
- **Impact**: Compromise would enable unauthorized API access or database manipulation
- **Hardened**: Properties file only; no encryption
- **Exposure**: Credentials visible in version control (redacted in this extraction)

### LOW RISK: web

- **Reason**: Standard servlet container configuration
- **Impact**: Minor; configures timeouts and auth method only
- **Hardened**: Minimal attack surface
- **Complexity**: Trivial to rebuild

## Exclusions

**Not included in this extraction** (noted for completeness):

- JSP pages or HTML templates (no UI layer provided)
- Struts/Spring configuration files (if present in original)
- Database DDL or stored procedures
- Test code or fixtures
- Database migration scripts

## Known Ambiguities

1. **Order Status State Machine**: The code references PENDING, APPROVED, and (implied) FULFILLED or SHIPPED states, but the full state diagram is not present in the extraction. Current code only validates cancellation eligibility.

2. **Platinum Tier Definition**: Only mentioned in OrderRules; no database query or configuration for determining tier shown. Assumed to be passed as a parameter.

3. **Card Validation Completeness**: No checksum validation (Luhn algorithm) is implemented. Only length and brand prefix are checked. This may be intentional or an implementation gap.

4. **Refund Dispute Period**: The 90-day refund window is hard-coded; no chargeback or dispute handling is visible.

5. **Shipping Calculation Scope**: Unclear whether "itemCount" includes bundled items, digital goods, or all SKUs equally.

## Next Steps for Requirements Extraction

Per J2EE adapter guidance, extraction should proceed in order:

1. **Database Schema** (if available) → validate hard-coded literals against constraints
2. **Configuration Files** → extract external dependencies and settings
3. **Class Hierarchies** → identify inheritance, bean scopes, EJB roles
4. **Validation Logic** → cross-check against web.xml, JSP scriptlets, annotation-based validators

Current extraction includes sufficient code to establish 6 core business rules and 5 structural risks.

## Files Analyzed

- `/legacy-source/conf/integration.properties` (3 LOC)
- `/legacy-source/conf/jdbc.properties` (4 LOC)
- `/legacy-source/modules/billing/src/com/petstore/billing/CreditCardValidator.java` (21 LOC)
- `/legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java` (28 LOC)
- `/legacy-source/web/WEB-INF/web.xml` (6 LOC)

**Total**: 62 LOC, 5 files, 4 modules
