import { EraContactInfoTelephonePipe } from './era-contact-info-telephone.pipe';
import { ContactInfo } from 'src/@core/models/era/full-era/contact-info/contact-info';

describe('EraPaymentMethodPipe', () => {
  it('create an instance', () => {
    let pipe = new EraContactInfoTelephonePipe();

    expect(pipe).toBeTruthy();
  });
  it('returns CommunicationNumber1 if CommunicationNumberQualifier1 is TE', () => {
    let contactInfo:ContactInfo = {CommunicationNumberQualifier1: 'TE', CommunicationNumber1: '123-456-7890'};

    expect(new EraContactInfoTelephonePipe().transform(contactInfo)).toEqual('123-456-7890');
  });
  it('returns CommunicationNumber2 if CommunicationNumberQualifier2 is TE', () => {
    let contactInfo:ContactInfo = {CommunicationNumberQualifier2: 'TE', CommunicationNumber2: '123-456-7890'};

    expect(new EraContactInfoTelephonePipe().transform(contactInfo)).toEqual('123-456-7890');
  });
  it('returns CommunicationNumber3 if CommunicationNumberQualifier3 is TE', () => {
    let contactInfo:ContactInfo = {CommunicationNumberQualifier3: 'TE', CommunicationNumber3: '123-456-7890'};

    expect(new EraContactInfoTelephonePipe().transform(contactInfo)).toEqual('123-456-7890');
  });
  it('returns null if none are TE', () => {
    let contactInfo:ContactInfo = {
      CommunicationNumberQualifier1: 'AB', 
      CommunicationNumber1: '123-456-7890',
      CommunicationNumberQualifier2: 'CD', 
      CommunicationNumber2: '123-456-7890',
      CommunicationNumberQualifier3: 'EF', 
      CommunicationNumber3: '123-456-7890',};

    expect(new EraContactInfoTelephonePipe().transform(contactInfo)).toEqual(null);
  });
});
