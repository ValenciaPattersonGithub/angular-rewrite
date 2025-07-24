import { Pipe, PipeTransform } from '@angular/core';
import { ClaimEntity } from 'src/patient/common/models/patient-apply-insurance-payment.model';

@Pipe({ name: 'remainingAmountToDistribute' })
export class RemainingAmountToDistributePipe implements PipeTransform {
  public transform(claimsList: ClaimEntity[], amount: number): number {
    let totalDistributed = 0;
    claimsList.forEach(claim => {
      claim.ServiceTransactionToClaimPaymentDtos.forEach(service => {
        totalDistributed += service.PaymentAmount;
      });
    });
    return amount - totalDistributed;
  }
}
