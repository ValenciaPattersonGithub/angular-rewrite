import { EraHasPayeeDetailsPipe } from './era-has-payee-details.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraHasPayeeDetailsPipe', () => {
  it('create an instance', () => {
    const pipe = new EraHasPayeeDetailsPipe();

    expect(pipe).toBeTruthy();
  });
  it('should return true when BillingDentistName', function () {
    let era:FullEraDto = { BillingDentistName: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when BillingDentistAddress1', function () {
    let era:FullEraDto = { BillingDentistAddress1: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when BillingDentistAddress2', function () {
    let era:FullEraDto = { BillingDentistAddress2: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when BillingDentistCity', function () {
    let era:FullEraDto = { BillingDentistCity: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when BillingDentistState', function () {
    let era:FullEraDto = { BillingDentistState: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when BillingDentistPostalCode', function () {
    let era:FullEraDto = { BillingDentistPostalCode: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when BillingDentistId', function () {
    let era:FullEraDto = { BillingDentistId: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when ReceiverId', function () {
    let era:FullEraDto = { ReceiverId: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayeeEntityIdentifierCode', function () {
    let era:FullEraDto = { PayeeEntityIdentifierCode: "value" };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true via PayeeAdditionalIdentifications', function () {
    let era:FullEraDto = { PayeeAdditionalIdentifications: [{ReferenceIdentifier: '12345', ReferenceIdentificationQualifier: 'PQ'}] };

    expect(new EraHasPayeeDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return undefined when none', function () {
    let era:FullEraDto = {};

    expect(new EraHasPayeeDetailsPipe().transform(era)).toEqual(undefined);
  });
  
});
