import { EraContactInfosWithTelephonePipe } from './era-contact-infos-with-telephone.pipe';
import { ContactInfo } from 'src/@core/models/era/full-era/contact-info/contact-info';

describe('EraPayerTechnicalInfosWithTelephonePipe', () => {
  it('create an instance', () => {
    const pipe = new EraContactInfosWithTelephonePipe();

    expect(pipe).toBeTruthy();
  });
  it('returns item if CommunicationNumberQualifier1 is TE', () => {
    let infos:ContactInfo[] = [{ CommunicationNumberQualifier1: 'TE', CommunicationNumber1: '123-456-7890'}];

    expect(new EraContactInfosWithTelephonePipe().transform(infos).length).toEqual(1);
  });
  it('returns item if CommunicationNumberQualifier2 is TE', () => {
    let infos:ContactInfo[] = [{CommunicationNumberQualifier2: 'TE', CommunicationNumber2: '123-456-7890'}];

    expect(new EraContactInfosWithTelephonePipe().transform(infos).length).toEqual(1);
  });
  it('returns item if CommunicationNumberQualifier3 is TE', () => {
    let infos:ContactInfo[] = [{CommunicationNumberQualifier3: 'TE', CommunicationNumber3: '123-456-7890'}];

    expect(new EraContactInfosWithTelephonePipe().transform(infos).length).toEqual(1);
  });
  it('returns nothing if none are TE', () => {
    let infos:ContactInfo[] = [{
      CommunicationNumberQualifier1: 'AB', 
      CommunicationNumber1: '123-456-7890',
      CommunicationNumberQualifier2: 'CD', 
      CommunicationNumber2: '123-456-7890',
      CommunicationNumberQualifier3: 'EF', 
      CommunicationNumber3: '123-456-7890',}];

    expect(new EraContactInfosWithTelephonePipe().transform(infos).length).toEqual(0);
  });
});
