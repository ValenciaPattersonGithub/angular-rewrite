import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraPayerClaimOfficeFax'
})
export class EraPayerClaimOfficeFaxPipe implements PipeTransform {

  transform(era: FullEraDto, ...args: any[]): any {
    if(era.PayerBusinessCommunicationNumberQualifier1 === 'FX')
      return era.PayerBusinessCommunicationNumber1;
    if(era.PayerBusinessCommunicationNumberQualifier2 === 'FX')
      return era.PayerBusinessCommunicationNumber2;
    if(era.PayerBusinessCommunicationNumberQualifier3 === 'FX')
      return era.PayerBusinessCommunicationNumber3;
    return null;
  }

}
