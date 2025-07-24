import { Pipe, PipeTransform } from '@angular/core';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

@Pipe({
  name: 'eraPatientName'
})
export class EraPatientNamePipe implements PipeTransform {
  transform(claim: EraClaimPaymentInfo): any {
    let text = "";
    if (claim) {
      if (claim.PatientLastName) {
        text += claim.PatientLastName;
      }
      if (claim.PatientNameSuffix) {
        text += " " + claim.PatientNameSuffix;
      }
      if (claim.PatientFirstName || claim.PatientMiddleName) {
        text += ", ";
      }
      if (claim.PatientFirstName) {
        text += claim.PatientFirstName + " ";
      }
      if (claim.PatientMiddleName) {
        text += claim.PatientMiddleName + " ";
      }
    }
    return text.trim();
  }
}
