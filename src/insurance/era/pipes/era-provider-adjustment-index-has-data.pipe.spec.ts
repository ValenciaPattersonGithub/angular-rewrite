import { EraProviderAdjustmentIndexHasDataPipe } from './era-provider-adjustment-index-has-data.pipe';
import { EraProviderAdjustment } from 'src/@core/models/era/full-era/provider-adjustment/era-provider-adjustment';

describe('EraProviderAdjustmentIndexHasDataPipe', () => {
  it('create an instance', () => {
    const pipe = new EraProviderAdjustmentIndexHasDataPipe();

    expect(pipe).toBeTruthy();
  });
  it('should return true when ProviderAdjustmentAmount[index]', function () {
    let adjustment:EraProviderAdjustment = { ProviderAdjustmentAmount1: 12 };
    var index = "1";

    expect(new EraProviderAdjustmentIndexHasDataPipe().transform(adjustment, index)).not.toEqual(undefined);
  });
  it('should return true when AdjustmentIdentifier[index]', function () {
    let adjustment:EraProviderAdjustment = { AdjustmentIdentifier1: "value" };
    var index = "1";

    expect(new EraProviderAdjustmentIndexHasDataPipe().transform(adjustment, index)).not.toEqual(undefined);
  });
  it('should return false when none', function () {
    let adjustment:EraProviderAdjustment = { };
    var index = "1";

    expect(new EraProviderAdjustmentIndexHasDataPipe().transform(adjustment, index)).toEqual(undefined);
  });
});
