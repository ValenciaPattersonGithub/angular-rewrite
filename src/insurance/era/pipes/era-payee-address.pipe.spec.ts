import { EraPayeeAddressPipe } from './era-payee-address.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraPayeeAddressPipe', () => {
  it('create an instance', () => {
    const pipe = new EraPayeeAddressPipe();

    expect(pipe).toBeTruthy();
  });
  
  it('should return correctly formatted payee address', function () {
    let era:FullEraDto = { BillingDentistAddress1: "One", BillingDentistAddress2: "Two" };
    var result = new EraPayeeAddressPipe().transform(era);

    expect(result).toEqual("One Two");
  });

  it('should return correctly formatted payee address when missing AddressOne', function () {
    let era:FullEraDto = { BillingDentistAddress1: "One" };
    var result = new EraPayeeAddressPipe().transform(era);

    expect(result).toEqual("One");
  });

  it('should return correctly formatted payee address when missing AddressTwo', function () {
    let era:FullEraDto= { BillingDentistAddress2: "Two" };
    var result = new EraPayeeAddressPipe().transform(era);

    expect(result).toEqual("Two");
  });

  it('should return correctly formatted payee address when missing both', function () {
    let era:FullEraDto  = {};
    var result = new EraPayeeAddressPipe().transform(era);

    expect(result).toEqual("");
  });
});
