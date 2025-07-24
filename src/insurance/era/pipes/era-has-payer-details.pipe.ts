import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraHasPayerDetails'
})
export class EraHasPayerDetailsPipe implements PipeTransform {
  transform(era: FullEraDto): any {
    return era.PayerName ||
      era.PayerAddressLine ||
      era.PayerAddressLine2 ||
      era.PayerCityName ||
      era.PayerStateCode ||
      era.PayerPostalCode ||
      era.PayerBusinessContactName ||
      era.PayerBusinessCommunicationNumberQualifier1 === 'FX' ||
      era.PayerBusinessCommunicationNumberQualifier2 === 'FX' ||
      era.PayerBusinessCommunicationNumberQualifier3 === 'FX' ||
      era.PayerBusinessCommunicationNumberQualifier1 === 'TE' ||
      era.PayerBusinessCommunicationNumberQualifier2 === 'TE' ||
      era.PayerBusinessCommunicationNumberQualifier3 === 'TE' ||
      (era.TechnicalContactInfos && era.TechnicalContactInfos.filter(info => info.CommunicationNumberQualifier1 === 'TE' || info.CommunicationNumberQualifier1 === 'TE' || info.CommunicationNumberQualifier1 === 'TE').length > 0) ||
      era.WebsiteCommunicationNumber1 ||
      era.PayerId ||
      era.PayerIdentifier;
  }
}
