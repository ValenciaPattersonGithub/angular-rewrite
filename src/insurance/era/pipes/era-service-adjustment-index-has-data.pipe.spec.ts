import { EraServiceAdjustmentIndexHasDataPipe } from './era-service-adjustment-index-has-data.pipe';
import { EraServiceAdjustment } from 'src/@core/models/era/full-era/header-number/claim-payment-info/service-payment-info/era-service-adjustment';

describe('EraServiceAdjustmentIndexHasDataPipe', () => {
  it('create an instance', () => {
    const pipe = new EraServiceAdjustmentIndexHasDataPipe();

    expect(pipe).toBeTruthy();
  });
  it('should return true when AdjustmentReasonCode[index]', function () {
    var adjustment:EraServiceAdjustment = { AdjustmentReasonCode1: "value" };
    var index = "1";

    expect(new EraServiceAdjustmentIndexHasDataPipe().transform(adjustment, index)).not.toEqual(undefined);
  });
  it('should return true when AdjustmentAmount[index]', function () {
    var adjustment:EraServiceAdjustment = { AdjustmentAmount1: 12 };
    var index = "1";

    expect(new EraServiceAdjustmentIndexHasDataPipe().transform(adjustment, index)).not.toEqual(undefined);
  });
  it('should return true when AdjustmentQuantity[index]', function () {
    var adjustment:EraServiceAdjustment = { AdjustmentQuantity1: 12 };
    var index = "1";

    expect(new EraServiceAdjustmentIndexHasDataPipe().transform(adjustment, index)).not.toEqual(undefined);
  });
  it('should return false when none', function () {
    var adjustment:EraServiceAdjustment = {};
    var index = "1";

    expect(new EraServiceAdjustmentIndexHasDataPipe().transform(adjustment, index)).toEqual(undefined);
  });
});
