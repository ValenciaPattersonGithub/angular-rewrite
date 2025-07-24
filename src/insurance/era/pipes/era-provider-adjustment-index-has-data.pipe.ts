import { Pipe, PipeTransform } from '@angular/core';
import { EraProviderAdjustment } from 'src/@core/models/era/full-era/provider-adjustment/era-provider-adjustment';

@Pipe({
  name: 'eraProviderAdjustmentIndexHasData'
})
export class EraProviderAdjustmentIndexHasDataPipe implements PipeTransform {

  transform(adjustment: EraProviderAdjustment, index: string): any {
    return adjustment['ProviderAdjustmentAmount' + index] ||
      adjustment['AdjustmentIdentifier' + index];
  }

}
