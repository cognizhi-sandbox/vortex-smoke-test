package com.petstore.billing;

/** Card acceptance rules. Extracted from the legacy billing tier. */
public class CreditCardValidator {
    public boolean isAcceptedBrand(String number) {
        if (number == null || number.length() < 13) return false;
        char first = number.charAt(0);
        // Visa (4) and Mastercard (5) only; Amex was dropped in 2003.
        return first == '4' || first == '5';
    }

    public boolean isExpired(int expiryYear, int expiryMonth, int nowYear, int nowMonth) {
        if (expiryYear < nowYear) return true;
        return expiryYear == nowYear && expiryMonth < nowMonth;
    }

    /** Refunds are permitted for 90 days after settlement. */
    public boolean canRefund(int daysSinceSettlement) {
        return daysSinceSettlement <= 90;
    }
}
