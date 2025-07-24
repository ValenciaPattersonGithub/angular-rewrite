import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraHasPayeeDetails'
})
export class EraHasPayeeDetailsPipe implements PipeTransform {
  transform(era: FullEraDto): any {
    return era.BillingDentistName ||
      era.BillingDentistAddress1 ||
      era.BillingDentistAddress2 ||
      era.BillingDentistCity ||
      era.BillingDentistState ||
      era.BillingDentistPostalCode ||
      era.BillingDentistId ||
      era.ReceiverId ||
      era.PayeeEntityIdentifierCode ||
      (era.PayeeAdditionalIdentifications && era.PayeeAdditionalIdentifications.filter(x => x.ReferenceIdentificationQualifier === 'PQ').length > 0);
  }
}
