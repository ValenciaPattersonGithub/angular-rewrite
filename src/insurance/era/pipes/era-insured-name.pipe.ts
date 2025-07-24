import { Pipe, PipeTransform } from '@angular/core';
import { EraClaimPaymentInfo } from 'src/@core/models/era/full-era/header-number/claim-payment-info/era-claim-payment-info';

@Pipe({
  name: 'eraInsuredName'
})
export class EraInsuredNamePipe implements PipeTransform {

  transform(claim: EraClaimPaymentInfo, ...args: any[]): any {
    let text = "";
    if (claim) {
      if (claim.PolicyHolderLastName) {
        text += claim.PolicyHolderLastName;
      }
      if (claim.PolicyHolderNameSuffix) {
        text += " " + claim.PolicyHolderNameSuffix;
      }
      if (claim.PolicyHolderFirstName || claim.PolicyHolderMiddleName) {
        text += ", ";
      }
      if (claim.PolicyHolderFirstName) {
        text += claim.PolicyHolderFirstName + " ";
      }
      if (claim.PolicyHolderMiddleName) {
        text += claim.PolicyHolderMiddleName + " ";
      }
    }
    return text.trim();
  }

}
