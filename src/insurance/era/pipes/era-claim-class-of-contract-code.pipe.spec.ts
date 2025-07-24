import { EraClaimClassOfContractCodePipe } from './era-claim-class-of-contract-code.pipe';
import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';

describe('EraClaimClassOfContractCodePipe', () => {
  it('create an instance', () => {
    const pipe = new EraClaimClassOfContractCodePipe();

    expect(pipe).toBeTruthy();
  });
  it('returns reference identifier if available', () => {
    let identifications: EraReferenceIdentification[] = [{ReferenceIdentificationQualifier: 'CE', ReferenceIdentifier: '1234'}];

    expect(new EraClaimClassOfContractCodePipe().transform(identifications)).toEqual('1234');
  });
  it('returns null if not available', () => {
    let identifications: EraReferenceIdentification[] = [{ReferenceIdentificationQualifier: 'TE', ReferenceIdentifier: '1234'}];

    expect(new EraClaimClassOfContractCodePipe().transform(identifications)).toEqual(null);
  });
});
