import { EraTotalChargeAmountPipe } from './era-total-charge-amount.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraTotalChargeAmountPipe', () => {
  it('create an instance', () => {
    const pipe = new EraTotalChargeAmountPipe();

    expect(pipe).toBeTruthy();
  });

  it('should return era total claim count', function () {
    let era:FullEraDto = {
      HeaderNumbers: [{ TotalClaimChargeAmount: 1.2, ClaimPaymentInfos: [] }, { TotalClaimChargeAmount: 2.4, ClaimPaymentInfos: [] }]
    };
    var result = new EraTotalChargeAmountPipe().transform(era);

    expect(result).toEqual(3.6);
  });

  it('should return 0 when no Header Numbers', function () {
    let era:FullEraDto = {};
    var result = new EraTotalChargeAmountPipe().transform(era);

    expect(result).toEqual(0);
  });
});
