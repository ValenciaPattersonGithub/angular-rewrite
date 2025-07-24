import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';
import { EraPayeeTaxIdPipe } from './era-payee-tax-id.pipe';

describe('EraPayeeTaxIdPipe', () => {
    it('create an instance', () => {
        const pipe = new EraPayeeTaxIdPipe();

        expect(pipe).toBeTruthy();
    });

    it('should return TaxId if row has TJ Qualifier', () => {
        let era:FullEraDto = { PayeeAdditionalIdentifications: [
            {ReferenceIdentifier: '777', ReferenceIdentificationQualifier: 'PQ'},
            {ReferenceIdentifier: '888', ReferenceIdentificationQualifier: 'TJ'}] };

        expect(new EraPayeeTaxIdPipe().transform(era.PayeeAdditionalIdentifications)).toEqual('888');
    });

    it('should return null if row does not have TJ Qualifier', () => {
        let era:FullEraDto = { PayeeAdditionalIdentifications: [
            {ReferenceIdentifier: '777', ReferenceIdentificationQualifier: 'PQ'},
            {ReferenceIdentifier: '888', ReferenceIdentificationQualifier: 'OR'}] };

        expect(new EraPayeeTaxIdPipe().transform(era.PayeeAdditionalIdentifications)).toBeNull();
    });
});
