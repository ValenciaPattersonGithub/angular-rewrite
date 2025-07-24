export enum TransactionEditDisabledReason {
    ClaimInProcess = 1,
    CreditOrDebitCardPayment = 2,
    CreditOrDebitCardReturn = 3,
    PaymentDeposited = 4,
    IsVendorPayment = 5,
    CurrentLocationDoesNotMatchAdjustmentLocation = 6,
    IsVendorPaymentRefund = 7,
};