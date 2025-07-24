import { Pipe, PipeTransform } from '@angular/core';
import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';

@Pipe({
  name: 'eraPayeeTaxId'
})
export class EraPayeeTaxIdPipe implements PipeTransform {

    transform(PayeeAdditionalIdentifications: EraReferenceIdentification[], ...args: any[]): any {
        const payeeTaxItems = PayeeAdditionalIdentifications.filter(x => x.ReferenceIdentificationQualifier === 'TJ');
        return payeeTaxItems != null && payeeTaxItems.length > 0 ? payeeTaxItems[0].ReferenceIdentifier : null;
    }
}