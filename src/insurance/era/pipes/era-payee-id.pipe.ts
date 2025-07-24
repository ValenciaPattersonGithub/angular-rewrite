import { Pipe, PipeTransform } from '@angular/core';
import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';

@Pipe({
  name: 'eraPayeeId'
})
export class EraPayeeIdPipe implements PipeTransform {

  transform(PayeeAdditionalIdentifications: EraReferenceIdentification[], ...args: any[]): any {
    const payerIdItems = PayeeAdditionalIdentifications.filter(x => x.ReferenceIdentificationQualifier === 'PQ');
    return payerIdItems != null && payerIdItems.length > 0 ? payerIdItems[0].ReferenceIdentifier : null;
  }

}
