import { Pipe, PipeTransform } from '@angular/core';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

@Pipe({
  name: 'eraTotalClaimCount'
})
export class EraTotalClaimCountPipe implements PipeTransform {
  transform(era: FullEraDto): any {
    if (era && era.HeaderNumbers) {
      return era.HeaderNumbers.reduce((total, header) => total + header.TotalClaimCount, 0);
    } else {
        return 0;
    }
  }
}
