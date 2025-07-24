import { Pipe, PipeTransform } from '@angular/core';
import { EraServiceAdjustment } from 'src/@core/models/era/full-era/header-number/claim-payment-info/service-payment-info/era-service-adjustment';

@Pipe({
  name: 'eraServiceAdjustmentIndexHasData'
})
export class EraServiceAdjustmentIndexHasDataPipe implements PipeTransform {
  transform(adjustment: EraServiceAdjustment, index: string): any {
    return adjustment['AdjustmentReasonCode' + index] ||
    adjustment['AdjustmentAmount' + index] ||
    adjustment['AdjustmentQuantity' + index];
  }
}
