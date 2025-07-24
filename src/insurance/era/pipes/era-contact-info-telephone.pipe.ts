import { Pipe, PipeTransform } from '@angular/core';
import { ContactInfo } from 'src/@core/models/era/full-era/contact-info/contact-info';

@Pipe({
  name: 'eraContactInfoTelephone'
})
export class EraContactInfoTelephonePipe implements PipeTransform {

  transform(info: ContactInfo, ...args: any[]): any {
    if(info.CommunicationNumberQualifier1 === 'TE')
      return info.CommunicationNumber1;
    if(info.CommunicationNumberQualifier2 === 'TE')
      return info.CommunicationNumber2;
    if(info.CommunicationNumberQualifier3 === 'TE')
      return info.CommunicationNumber3;
    return null;
  }

}
