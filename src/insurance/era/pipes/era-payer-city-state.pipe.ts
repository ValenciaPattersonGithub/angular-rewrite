import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraPayerCityState'
})
export class EraPayerCityStatePipe implements PipeTransform {
  transform(era: FullEraDto): any {
    let text = "";
    if (era) {
      if (era.PayerCityName) {
        text += era.PayerCityName;
        if (era.PayerStateCode || era.PayerPostalCode) {
          text += ", ";
        }
      }
      if (era.PayerStateCode) {
        text += era.PayerStateCode + " ";
      }
      if (era.PayerPostalCode) {
        text += era.PayerPostalCode;
      }
    }
    return text.trim();
  }
}
