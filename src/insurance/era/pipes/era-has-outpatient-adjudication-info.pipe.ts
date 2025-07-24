import { Pipe, PipeTransform } from '@angular/core';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

@Pipe({
  name: 'eraHasOutpatientAdjudicationInfo'
})
export class EraHasOutpatientAdjudicationInfoPipe implements PipeTransform {
  transform(claim: EraClaimPaymentInfo, ...args: any[]): any {
    return claim.OutpatientReimbursementRate ||
      claim.OutpatientClaimHCSPCSPayableAmount ||
      claim.OutpatientClaimPaymentRemarkCode1 ||
      claim.OutpatientClaimPaymentRemarkCode2 ||
      claim.OutpatientClaimPaymentRemarkCode3 ||
      claim.OutpatientClaimPaymentRemarkCode4 ||
      claim.OutpatientClaimPaymentRemarkCode5 ||
      claim.OutpatientClaimESRDPaymentAmount ||
      claim.OutpatientNonpayableProfessionalComponentAmount;
  }
}
