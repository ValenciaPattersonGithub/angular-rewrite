import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraPayeeCityState'
})
export class EraPayeeCityStatePipe implements PipeTransform {
  transform(era: FullEraDto): any {
    let text = "";
    if (era) {
      if (era.BillingDentistCity) {
        text += era.BillingDentistCity;
        if (era.BillingDentistState || era.BillingDentistPostalCode) {
          text += ", ";
        }
      }
      if (era.BillingDentistState) {
        text += era.BillingDentistState + " ";
      }
      if (era.BillingDentistPostalCode) {
        text += era.BillingDentistPostalCode;
      }
    }
    return text.trim();
  }
}
