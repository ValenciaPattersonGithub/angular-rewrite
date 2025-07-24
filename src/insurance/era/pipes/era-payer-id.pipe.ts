import { Pipe, PipeTransform } from '@angular/core';
import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';

@Pipe({
  name: 'eraPayerId'
})
export class EraPayerIdPipe implements PipeTransform {
    
    transform(PayeeAdditionalIdentifications: EraReferenceIdentification[], ...args: any[]): any {
        var payerIdItems = PayeeAdditionalIdentifications.filter(x => x.ReferenceIdentificationQualifier === '2U');
        return payerIdItems != null && payerIdItems.length > 0 ? payerIdItems[0].ReferenceIdentifier : null;
    }


}
