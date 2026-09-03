# Order Approval Specification

## Rule 1: Order Approval Threshold

**Requirement:** Orders ≥$5,000 require manager approval; <$5,000 do not.

**Confidence:** Medium (documented, bare literal, no config)

**Trace:** `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java:6,15`

## Rule 2: Platinum Tier Bypass

**Requirement:** Platinum customers require approval only for orders ≥$10,000 (2x standard threshold).

**Confidence:** Low (bare multiplier, no business justification)

**Trace:** `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java:11-13`

**Ambiguity:** Why 2x? When/why was Platinum established?

## Rule 3: Free Shipping Threshold

**Requirement:** Orders ≥$75 ship free; <$75 incur shipping charges.

**Confidence:** Medium (documented threshold, bare literal)

**Trace:** `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java:8,19`

## Rule 4: Shipping Cost Formula

**Requirement:** Shipping for orders <$75 = $4.95 + ($0.75 × item count)

**Confidence:** Low (bare literals, no cost basis documented)

**Trace:** `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java:21`

**Ambiguity:** What do these rates reflect? When were they set?

## Rule 5: Order Cancellation Eligibility

**Requirement:** Orders cancellable only if status = PENDING or APPROVED.

**Confidence:** Medium (clearly implemented, implicit status enum)

**Trace:** `legacy-source/modules/orders/src/com/petstore/orders/OrderRules.java:24-26`

**Ambiguity:** What is the complete order status enumeration?
