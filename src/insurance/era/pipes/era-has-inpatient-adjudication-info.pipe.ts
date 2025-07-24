import { Pipe, PipeTransform } from '@angular/core';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

@Pipe({
  name: 'eraHasInpatientAdjudicationInfo'
})
export class EraHasInpatientAdjudicationInfoPipe implements PipeTransform {
  transform(claim: EraClaimPaymentInfo, ...args: any[]): any {
    return claim.InpatientCoveredDaysOrVisitsCount ||
      claim.InpatientPPSOperatingOutlierAmount ||
      claim.InpatientLifetimePsychiatricDaysCount ||
      claim.InpatientClaimDRGAmount ||
      claim.InpatientClaimPaymentRemarkCode ||
      claim.InpatientClaimDisproportionateShareAmount ||
      claim.InpatientClaimMSPPassthroughAmount ||
      claim.InpatientClaimPPSCapitalAmount ||
      claim.InpatientPPSCapitalFSPDRGAmount ||
      claim.InpatientPPSCapitalHSPDRGAmount ||
      claim.InpatientPPSCapitalDSHDRGAmount ||
      claim.InpatientOldCapitalAmount||
      claim.InpatientPPSCapitalIMEAmount ||
      claim.InpatientPPSOperatingHospitalSpecificDRGAmount ||
      claim.InpatientCostReportDayCount ||
      claim.InpatientPPSOperatingFederalSpecificDRGAmount ||
      claim.InpatientClaimPPSCapitalOutlierAmount ||
      claim.InpatientClaimIndirectTeachingAmount ||
      claim.InpatientNonpayableProfessionalComponentAmount ||
      claim.InpatientClaimPaymentRemarkCode1 ||
      claim.InpatientClaimPaymentRemarkCode2 ||
      claim.InpatientClaimPaymentRemarkCode3 ||
      claim.InpatientClaimPaymentRemarkCode4 ||
      claim.InpatientPPSCapitalExceptionAmount;
  }
}
