import { Pipe, PipeTransform } from '@angular/core';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

@Pipe({
  name: 'eraHasClaimPaymentInfo'
})
export class EraHasClaimPaymentInfoPipe implements PipeTransform {
  transform(claim: EraClaimPaymentInfo): any {
    return claim.PatientLastName ||
      claim.PatientFirstName ||
      claim.PatientMiddleName ||
      claim.PatientNameSuffix ||
      claim.PolicyHolderLastName ||
      claim.PolicyHolderFirstName ||
      claim.PolicyHolderMiddleName ||
      claim.PolicyHolderNameSuffix ||
      claim.PatientId ||
      claim.CorrectedFirstName ||
      claim.CorrectedLastName ||
      claim.CorrectedMiddleName ||
      claim.CorrectedNameSuffix ||
      claim.CorrectedId ||
      claim.PolicyHolderId ||
      (claim.OtherClaimRelatedIdentifications && claim.OtherClaimRelatedIdentifications.filter(info => info.ReferenceIdentificationQualifier === 'CE').length > 0) ||
      claim.PayerClaimControlNumber ||
      (claim.ClaimContactInformations && claim.ClaimContactInformations.filter((info) => info.CommunicationNumberQualifier1 === 'TE' || info.CommunicationNumberQualifier1 === 'TE' || info.CommunicationNumberQualifier1 === 'TE').length > 0) ||
      (claim.StatementDates && claim.StatementDates.length > 0) ||
      claim.ClaimReceivedDate ||
      claim.TotalClaimChargeAmount  ||
      claim.ClaimPaymentAmount ||
      claim.PatientResponsibilityAmount ||
      (claim.ClaimSupplementalInformations && claim.ClaimSupplementalInformations.filter(x => x.AmountQualifierCode === 'AU' || x.AmountQualifierCode === 'F5').length > 0) ||
      claim.ClaimStatusCode ||
      claim.TreatingDentistId;
  }
}
