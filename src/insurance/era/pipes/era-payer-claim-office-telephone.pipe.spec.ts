import { EraPayerClaimOfficeTelephonePipe } from './era-payer-claim-office-telephone.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';

describe('EraPayerClaimOfficeTelephonePipe', () => {
  it('create an instance', () => {
    const pipe = new EraPayerClaimOfficeTelephonePipe();

    expect(pipe).toBeTruthy();
  });
  it('returns PayerBusinessCommunicationNumber1 when Qualifier1 is TE', () => {
    let era:FullEraDto = {PayerBusinessCommunicationNumberQualifier1: 'TE', PayerBusinessCommunicationNumber1: '1234'};

    expect(new EraPayerClaimOfficeTelephonePipe().transform(era)).toEqual('1234');
  });
  it('returns PayerBusinessCommunicationNumber2 when Qualifier2 is TE', () => {
    let era:FullEraDto = {PayerBusinessCommunicationNumberQualifier2: 'TE', PayerBusinessCommunicationNumber2: '1234'};

    expect(new EraPayerClaimOfficeTelephonePipe().transform(era)).toEqual('1234');
  });
  it('returns PayerBusinessCommunicationNumber3 when Qualifier3 is TE', () => {
    let era:FullEraDto = {PayerBusinessCommunicationNumberQualifier3: 'TE', PayerBusinessCommunicationNumber3: '1234'};

    expect(new EraPayerClaimOfficeTelephonePipe().transform(era)).toEqual('1234');
  });
  it('returns null when no qualifier is FX', () => {
    let era:FullEraDto = {
      PayerBusinessCommunicationNumberQualifier1: 'FX', 
      PayerBusinessCommunicationNumber1: '1234',
      PayerBusinessCommunicationNumberQualifier2: 'FX', 
      PayerBusinessCommunicationNumber2: '1234',
      PayerBusinessCommunicationNumberQualifier3: 'FX', 
      PayerBusinessCommunicationNumber3: '1234'
    };

    expect(new EraPayerClaimOfficeTelephonePipe().transform(era)).toEqual(null);
  });

});
