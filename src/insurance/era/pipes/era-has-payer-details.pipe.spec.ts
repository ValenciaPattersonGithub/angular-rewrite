import { EraHasPayerDetailsPipe } from './era-has-payer-details.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraHasPayerDetailsPipe', () => {
  it('create an instance', () => {
    const pipe = new EraHasPayerDetailsPipe();

    expect(pipe).toBeTruthy();
  });
  it('should return true when PayerName', function () {
    let era:FullEraDto = { PayerName: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerAddressLine', function () {
    let era:FullEraDto = { PayerAddressLine: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerAddressLine2', function () {
    let era:FullEraDto = { PayerAddressLine2: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerCityName', function () {
    let era:FullEraDto = { PayerCityName: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerStateCode', function () {
    let era:FullEraDto = { PayerStateCode: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerPostalCode', function () {
    let era:FullEraDto = { PayerPostalCode: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerBusinessContactName', function () {
    let era:FullEraDto = { PayerBusinessContactName: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerBusinessCommunicationNumberQualifier1', function () {
    let era:FullEraDto = { PayerBusinessCommunicationNumberQualifier1: "FX" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerBusinessCommunicationNumberQualifier2', function () {
    let era:FullEraDto = { PayerBusinessCommunicationNumberQualifier2: "FX" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerBusinessCommunicationNumberQualifier3', function () {
    let era:FullEraDto = { PayerBusinessCommunicationNumberQualifier3: "FX" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when TechnicalContactInfos', function () {
    let era:FullEraDto = { TechnicalContactInfos: [{CommunicationNumberQualifier1: 'TE'}] };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when WebsiteCommunicationNumber1', function () {
    let era:FullEraDto = { WebsiteCommunicationNumber1: "www.com" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerId', function () {
    let era:FullEraDto = { PayerId: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return true when PayerIdentifier', function () {
    let era:FullEraDto = { PayerIdentifier: "value" };

    expect(new EraHasPayerDetailsPipe().transform(era)).not.toEqual(undefined);
  });
  it('should return false when none', function () {
    let era:FullEraDto = { };

    expect(new EraHasPayerDetailsPipe().transform(era)).toEqual(undefined);
  });
});
