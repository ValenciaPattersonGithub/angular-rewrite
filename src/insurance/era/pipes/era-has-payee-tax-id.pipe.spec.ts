import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';
import { EraHasPayeeTaxIdPipe } from './era-has-payee-tax-id.pipe';

describe('EraHasPayeeTaxIdPipe', () => {
    it('create an instance', () => {
        const pipe = new EraHasPayeeTaxIdPipe();

        expect(pipe).toBeTruthy();
    });

    it('should return true if row has TJ Qualifier', () => {
        let era: FullEraDto = {
            PayeeAdditionalIdentifications: [
                { ReferenceIdentifier: '777', ReferenceIdentificationQualifier: 'PQ' },
                { ReferenceIdentifier: '888', ReferenceIdentificationQualifier: 'TJ' }]
        };

        expect(new EraHasPayeeTaxIdPipe().transform(era.PayeeAdditionalIdentifications)).toBe(true);
    });

    it('should return false if row does not have TJ Qualifier', () => {
        let era: FullEraDto = {
            PayeeAdditionalIdentifications: [
                { ReferenceIdentifier: '777', ReferenceIdentificationQualifier: 'PQ' },
                { ReferenceIdentifier: '888', ReferenceIdentificationQualifier: 'OR' }]
        };

        expect(new EraHasPayeeTaxIdPipe().transform(era.PayeeAdditionalIdentifications)).toBe(false)
    });
});
