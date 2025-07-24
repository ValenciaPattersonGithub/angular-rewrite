import { EraPayeeCityStatePipe } from './era-payee-city-state.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraPayeeCityStatePipe', () => {
  it('create an instance', () => {
    const pipe = new EraPayeeCityStatePipe();

    expect(pipe).toBeTruthy();
  });

  it('should return correctly formatted payee city state', function () {
    let era:FullEraDto = { BillingDentistCity: "123 St", BillingDentistState: "HI", BillingDentistPostalCode: "00000" };
    var result = new EraPayeeCityStatePipe().transform(era);

    expect(result).toEqual("123 St, HI 00000");
});

it('should return correctly formatted payee city state when missing city', function () {
    let era:FullEraDto = { BillingDentistState: "HI", BillingDentistPostalCode: "00000" };
    var result = new EraPayeeCityStatePipe().transform(era);

    expect(result).toEqual("HI 00000");
});

it('should return correctly formatted payee city state when missing state', function () {
    let era:FullEraDto = { BillingDentistCity: "123 St", BillingDentistPostalCode: "00000" };
    var result = new EraPayeeCityStatePipe().transform(era);

    expect(result).toEqual("123 St, 00000");
});

it('should return correctly formatted payee city state when missing zip', function () {
    let era:FullEraDto = { BillingDentistCity: "123 St", BillingDentistState: "HI" };
    var result = new EraPayeeCityStatePipe().transform(era);

    expect(result).toEqual("123 St, HI");
});
});
