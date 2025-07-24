import { EraPayerClaimOfficeFaxPipe } from './era-payer-claim-office-fax.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraPayerClaimOfficeFaxPipe', () => {
  it('create an instance', () => {
    const pipe = new EraPayerClaimOfficeFaxPipe();

    expect(pipe).toBeTruthy();
  });
  it('returns PayerBusinessCommunicationNumber1 when Qualifier1 is FX', () => {
    let era:FullEraDto = {PayerBusinessCommunicationNumberQualifier1: 'FX', PayerBusinessCommunicationNumber1: '1234'};

    expect(new EraPayerClaimOfficeFaxPipe().transform(era)).toEqual('1234');
  });
  it('returns PayerBusinessCommunicationNumber2 when Qualifier2 is FX', () => {
    let era:FullEraDto = {PayerBusinessCommunicationNumberQualifier2: 'FX', PayerBusinessCommunicationNumber2: '1234'};

    expect(new EraPayerClaimOfficeFaxPipe().transform(era)).toEqual('1234');
  });
  it('returns PayerBusinessCommunicationNumber3 when Qualifier3 is FX', () => {
    let era:FullEraDto = {PayerBusinessCommunicationNumberQualifier3: 'FX', PayerBusinessCommunicationNumber3: '1234'};

    expect(new EraPayerClaimOfficeFaxPipe().transform(era)).toEqual('1234');
  });
  it('returns null when no qualifier is FX', () => {
    let era:FullEraDto = {
      PayerBusinessCommunicationNumberQualifier1: 'TE', 
      PayerBusinessCommunicationNumber1: '1234',
      PayerBusinessCommunicationNumberQualifier2: 'TE', 
      PayerBusinessCommunicationNumber2: '1234',
      PayerBusinessCommunicationNumberQualifier3: 'TE', 
      PayerBusinessCommunicationNumber3: '1234'
    };

    expect(new EraPayerClaimOfficeFaxPipe().transform(era)).toEqual(null);
  });
});
