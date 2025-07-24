import { EraPayeeIdPipe } from './era-payee-id.pipe';
import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';

describe('EraPayeeIdPipe', () => {
  it('create an instance', () => {
    const pipe = new EraPayeeIdPipe();

    expect(pipe).toBeTruthy();
  });
  it('returns reference identifier when qualifier is PQ', () => {
    let identifications:EraReferenceIdentification[] = [{ReferenceIdentificationQualifier: 'PQ', ReferenceIdentifier: '2345'}];

    expect(new EraPayeeIdPipe().transform(identifications)).toEqual('2345');
  });
  it('returns null when no PQ qualifier', () => {
    let identifications:EraReferenceIdentification[] = [];

    expect(new EraPayeeIdPipe().transform(identifications)).toEqual(null);
  });
});
