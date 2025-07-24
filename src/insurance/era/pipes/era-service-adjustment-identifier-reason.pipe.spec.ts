import { EraServiceAdjustmentIdentifierReasonPipe } from './era-service-adjustment-identifier-reason.pipe';

describe('EraServiceAdjustmentIdentifierReasonPipe', () => {    
    const mockLocalizeService: any = {
        getLocalizedString: () => 'translated text'
    };    

    it('create an instance', () => {
        let pipe = new EraServiceAdjustmentIdentifierReasonPipe(mockLocalizeService);

        expect(pipe).toBeTruthy();
    });

    it('create return Service Adjustment Reason that matches identifier', () => {
        let pipe = new EraServiceAdjustmentIdentifierReasonPipe(mockLocalizeService);       
        let identifier = '03'
        expect(pipe.transform(identifier)).toEqual('translated text');
    });
});