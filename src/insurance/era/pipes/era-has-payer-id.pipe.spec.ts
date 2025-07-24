import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';
import { EraHasPayerIdPipe } from './era-has-payer-id.pipe';

describe('EraHasPayerIdPipe', () => {
    it('create an instance', () => {
        const pipe = new EraHasPayerIdPipe();
        expect(pipe).toBeTruthy();
    });

    it('returns true when qualifier exists and is 2U', () => {
        const pipe = new EraHasPayerIdPipe();
        let identifications: EraReferenceIdentification[] = [{ ReferenceIdentificationQualifier: '2U', ReferenceIdentifier: '123456789' }];
        expect(pipe.transform(identifications)).toEqual(true);
    });
    it('returns null when no 2U qualifier', () => {
        const pipe = new EraHasPayerIdPipe();
        let identifications: EraReferenceIdentification[] = [{ ReferenceIdentificationQualifier: 'PQ', ReferenceIdentifier: '123456789' }];
        expect(pipe.transform(identifications)).toEqual(false);
    });
});
