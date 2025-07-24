import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraTotalChargeAmount'
})
export class EraTotalChargeAmountPipe implements PipeTransform {
  transform(era: FullEraDto): any {
    if (era && era.HeaderNumbers) {
      //fix floating point issues by rounding
      return +(era.HeaderNumbers.reduce((total, header) => total + header.TotalClaimChargeAmount, 0).toFixed(2));
    } else {
        return 0;
    }
  }
}
