import { EraReferenceIdentification } from 'src/@core/models/era/full-era/reference-identification/era-reference-identification';
import { EraPayerIdPipe } from './era-payer-id.pipe';

describe('EraPayerIdPipe', () => {
    describe('EraPayerIdPipe', () => {
        it('create an instance', () => {
            const pipe = new EraPayerIdPipe();
            expect(pipe).toBeTruthy();
        });
        it('returns reference identifier when qualifier is 2U', () => {
            let identifications: EraReferenceIdentification[] = [{ ReferenceIdentificationQualifier: '2U', ReferenceIdentifier: '123456789' }];
            expect(new EraPayerIdPipe().transform(identifications)).toEqual('123456789');
        });
        it('returns null when no 2U qualifier', () => {
            let identifications: EraReferenceIdentification[] = [{ ReferenceIdentificationQualifier: 'PQ', ReferenceIdentifier: '123456789' }];
            expect(new EraPayerIdPipe().transform(identifications)).toEqual(null);
        });
    });
});
