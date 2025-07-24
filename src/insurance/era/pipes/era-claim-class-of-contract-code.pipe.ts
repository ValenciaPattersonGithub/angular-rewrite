import { Pipe, PipeTransform } from '@angular/core';
import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';

@Pipe({
  name: 'eraClaimClassOfContractCode'
})
export class EraClaimClassOfContractCodePipe implements PipeTransform {

  transform(OtherClaimRelatedIdentifications: EraReferenceIdentification[], ...args: any[]): any {
    const classOfContractCodes = OtherClaimRelatedIdentifications.filter(info => info.ReferenceIdentificationQualifier === 'CE');
    return classOfContractCodes && classOfContractCodes.length > 0 ? classOfContractCodes[0].ReferenceIdentifier : null;
  }

}
