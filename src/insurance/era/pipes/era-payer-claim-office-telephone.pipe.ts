import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraPayerClaimOfficeTelephone'
})
export class EraPayerClaimOfficeTelephonePipe implements PipeTransform {

  transform(era: FullEraDto, ...args: any[]): any {
    if(era.PayerBusinessCommunicationNumberQualifier1 === 'TE')
      return era.PayerBusinessCommunicationNumber1;
    if(era.PayerBusinessCommunicationNumberQualifier2 === 'TE')
      return era.PayerBusinessCommunicationNumber2;
    if(era.PayerBusinessCommunicationNumberQualifier3 === 'TE')
      return era.PayerBusinessCommunicationNumber3;
    return null;
  }

}
