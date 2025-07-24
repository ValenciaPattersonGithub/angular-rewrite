import { Pipe, PipeTransform } from '@angular/core';
import { EraAmountData } from 'src/@core/models/era/full-era/amount-data/era-amount-data';

@Pipe({
  name: 'eraAmountData'
})
export class EraAmountDataPipe implements PipeTransform {
  transform(AmountDatas: EraAmountData[], field: string): any {
    const datas = AmountDatas.filter(x => x.AmountQualifierCode === field);
    return datas && datas.length > 0 ? datas[0].ClaimSupplementalInformationAmount : null;
  }
}
