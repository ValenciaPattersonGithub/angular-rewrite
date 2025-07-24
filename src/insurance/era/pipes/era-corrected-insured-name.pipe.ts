import { Pipe, PipeTransform } from '@angular/core';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

@Pipe({
  name: 'eraCorrectedInsuredName'
})
export class EraCorrectedInsuredNamePipe implements PipeTransform {

  transform(claim: EraClaimPaymentInfo, ...args: any[]): any {
    let text = "";
    if (claim) {
      if (claim.CorrectedLastName) {
        text += claim.CorrectedLastName;
      }
      if (claim.CorrectedNameSuffix) {
        text += " " + claim.CorrectedNameSuffix;
      }
      if (claim.CorrectedFirstName || claim.CorrectedMiddleName) {
        text += ", ";
      }
      if (claim.CorrectedFirstName) {
        text += claim.CorrectedFirstName + " ";
      }
      if (claim.CorrectedMiddleName) {
        text += claim.CorrectedMiddleName + " ";
      }
    }
    return text.trim();
  }

}
