import { EraAmountDataPipe } from './era-amount-data.pipe';
import { EraAmountData } from 'src/@core/models/era/full-era/amount-data/era-amount-data';

describe('EraAmountDataPipe', () => {
  it('create an instance', () => {
    const pipe = new EraAmountDataPipe();

    expect(pipe).toBeTruthy();
  });
  it('returns amount if available', () => {
    let datas:EraAmountData[] = [{AmountQualifierCode: 'AU', ClaimSupplementalInformationAmount: 12}]

    expect(new EraAmountDataPipe().transform(datas, 'AU')).toEqual(12);
  })
  it('returns null if not available', () => {
    let datas:EraAmountData[] = [{AmountQualifierCode: 'AU', ClaimSupplementalInformationAmount: 12}]

    expect(new EraAmountDataPipe().transform(datas, 'TE')).toEqual(null);
  })
});
