import { Pipe, PipeTransform } from '@angular/core';
import { ContactInfo } from 'src/@core/models/era/full-era/contact-info/contact-info';

@Pipe({
  name: 'eraContactInfosWithTelephone'
})
export class EraContactInfosWithTelephonePipe implements PipeTransform {
  transform(infos: ContactInfo[], ...args: any[]): any {
    return infos.filter(info => info.CommunicationNumberQualifier1 === 'TE' || info.CommunicationNumberQualifier2 === 'TE' || info.CommunicationNumberQualifier3 === 'TE');
  }
}
