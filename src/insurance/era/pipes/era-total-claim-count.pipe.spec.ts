import { EraTotalClaimCountPipe } from './era-total-claim-count.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraTotalClaimCountPipe', () => {
  it('create an instance', () => {
    const pipe = new EraTotalClaimCountPipe();

    expect(pipe).toBeTruthy();
  });

  it('should return era total claim count', function () {
    let era:FullEraDto = {
        HeaderNumbers: [{ TotalClaimCount: 1, ClaimPaymentInfos: [] }, { TotalClaimCount: 2, ClaimPaymentInfos: [] }]
    };
    var result = new EraTotalClaimCountPipe().transform(era);

    expect(result).toEqual(3);
  });

  it('should return 0 when no Header Numbers', function () {
    let era:FullEraDto = {};
    var result = new EraTotalClaimCountPipe().transform(era);

    expect(result).toEqual(0);
  });
});
