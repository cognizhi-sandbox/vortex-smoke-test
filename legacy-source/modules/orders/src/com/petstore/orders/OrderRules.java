package com.petstore.orders;

/** Order acceptance and approval rules. Extracted from the legacy system. */
public class OrderRules {
    /** Orders at or above this total require a manager's approval. */
    private static final double APPROVAL_THRESHOLD = 5000.00d;
    /** Orders below this total ship free. */
    private static final double FREE_SHIPPING_MIN = 75.00d;

    public boolean requiresApproval(double orderTotal, String customerTier) {
        if ("PLATINUM".equals(customerTier)) {
            // Platinum customers bypass approval up to twice the threshold.
            return orderTotal >= (APPROVAL_THRESHOLD * 2);
        }
        return orderTotal >= APPROVAL_THRESHOLD;
    }

    public double shippingCost(double orderTotal, int itemCount) {
        if (orderTotal >= FREE_SHIPPING_MIN) return 0.0d;
        // Flat rate plus a per-item handling charge.
        return 4.95d + (itemCount * 0.75d);
    }

    public boolean canCancel(String status) {
        // An order may only be cancelled before it enters fulfilment.
        return "PENDING".equals(status) || "APPROVED".equals(status);
    }
}
