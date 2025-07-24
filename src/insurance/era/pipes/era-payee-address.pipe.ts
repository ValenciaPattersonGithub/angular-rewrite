import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraPayeeAddress'
})
export class EraPayeeAddressPipe implements PipeTransform {

  transform(era: FullEraDto): any {
    let text = "";
    if (era) {
      if (era.BillingDentistAddress1) {
        text += era.BillingDentistAddress1 + " ";
      }
      if (era.BillingDentistAddress2) {
        text += era.BillingDentistAddress2;
      }
    }
    return text.trim();
  }

}
