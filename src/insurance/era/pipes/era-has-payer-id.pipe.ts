import { Pipe, PipeTransform } from '@angular/core';
import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';

@Pipe({
  name: 'eraHasPayerId'
})
export class EraHasPayerIdPipe implements PipeTransform {

    transform(PayeeAdditionalIdentifications: EraReferenceIdentification[], ...args: any[]): any {
        return PayeeAdditionalIdentifications && PayeeAdditionalIdentifications.filter(x => x.ReferenceIdentificationQualifier === '2U').length > 0;
    }
}
