import { EraPayerCityStatePipe } from './era-payer-city-state.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraPayerCityStatePipe', () => {
  it('create an instance', () => {
    const pipe = new EraPayerCityStatePipe();

    expect(pipe).toBeTruthy();
  });
  it('should return correctly formatted city state', function () {
    let era:FullEraDto = { PayerCityName: "123 St", PayerStateCode: "HI", PayerPostalCode: "00000" };
    var result = new EraPayerCityStatePipe().transform(era);

    expect(result).toEqual("123 St, HI 00000");
  });

  it('should return correctly formatted city state when missing city', function () {
    let era:FullEraDto = { PayerStateCode: "HI", PayerPostalCode: "00000" };
    var result = new EraPayerCityStatePipe().transform(era);

    expect(result).toEqual("HI 00000");
  });

  it('should return correctly formatted city state when missing state', function () {
    let era:FullEraDto = { PayerCityName: "123 St", PayerPostalCode: "00000" };
    var result = new EraPayerCityStatePipe().transform(era);

    expect(result).toEqual("123 St, 00000");
  });

  it('should return correctly formatted city state when missing zip', function () {
    let era:FullEraDto = { PayerCityName: "123 St", PayerStateCode: "HI" };
    var result = new EraPayerCityStatePipe().transform(era);

    expect(result).toEqual("123 St, HI");
  });
});
