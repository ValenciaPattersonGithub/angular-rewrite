
import { Pipe, PipeTransform } from '@angular/core';
import { ClaimDto } from 'src/@core/models/bulk-payment/bulk-insurance-dtos.model';

@Pipe({
  name: 'insurancePaymentIsValidPipe'
})
export class InsurancePaymentIsValidPipe implements PipeTransform {
    transform(claimsList: ClaimDto [], canEditAllowedAmount: boolean): boolean {        
        // validate that at least one claim has a value or is being closed
        const hasValidClaim = claimsList.some(claim => claim.FinalPayment || claim.PaymentAmount > 0);
        if (!hasValidClaim) {
            return false;
        }

        // Determining the maximum allowed payment for each service transaction
    
        // if canEditAllowedAmount is true and the service is on a fee schedule
        // then the maximum allowed payment is the lesser of the charges or the allowed amount minus the total insurance payments
        // otherwise, the maximum allowed payment is the charges minus the total insurance payments

        // if canEditAllowedAmount is false OR the service is not on a fee schedule
        // then the maximum allowed payment is the charges minus the total insurance payments

        // validate that each service amount is not more than is allowed
        for (const claim of claimsList) {
            for (const serviceTransaction of claim.ServiceTransactionToClaimPaymentDtos) {
                let maxAllowedPayment = serviceTransaction.Charges - serviceTransaction.TotalInsurancePayments;
                if (canEditAllowedAmount) {
                    // if existing fee schedule item validate against allowed amount
                    // if new fee schedule item validate against allowed amount
                    if ((serviceTransaction.FeeScheduleGroupDetailId || serviceTransaction.AllowedAmount !== serviceTransaction.OriginalAllowedAmount)) {                        
                        maxAllowedPayment = Math.min(serviceTransaction.AllowedAmount, serviceTransaction.Charges) - serviceTransaction.TotalInsurancePayments;                    
                    }
                }
                // Ensure payment and maxAllowedPayment is a fixed decimal value to avoid floating point precision issues
                maxAllowedPayment = parseFloat(maxAllowedPayment.toFixed(2));
                const paymentAmount = parseFloat((serviceTransaction.PaymentAmount ? serviceTransaction.PaymentAmount : 0).toFixed(2));
                if (paymentAmount > 0 && (paymentAmount > maxAllowedPayment)) {
                    return false;
                }
            }
        }
        return true;
    }
}
