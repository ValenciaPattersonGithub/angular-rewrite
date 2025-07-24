import {
    EncounterTotalAmountPipe, EncounterTotalTaxPipe, EncounterTotalDiscountPipe,
    EncounterTotalFeePipe, EncounterTotalAdjEstPipe, EncounterTotalEstinsPipe, EncounterTotalPatientPortionPipe, EncounterTotalAllowedAmountPipe
} from 'src/@shared/pipes/encounter/encounter-totals.pipe';

describe('encounterTotalsPipes', function () {


    var services: any[];
    services = [
        {
            Fee: 10, Discount: 10, Tax: 5, Amount: 50, ObjectState: 'Delete', AllowedAmount: 5,
            InsuranceEstimates: [
                { EstInsurance: 10, AdjEst: 9, PaidAmount: 0 },
                { EstInsurance: 7, AdjEst: 8, PaidAmount: 0 },
            ]
        },
        {
            Fee: 15, Discount: 5, Tax: 6, Amount: 100, ObjectState: 'Add', AllowedAmount: 3,
            InsuranceEstimates: [
                { EstInsurance: 11, AdjEst: 7, PaidAmount: 0 },
                { EstInsurance: 8, AdjEst: 6, PaidAmount: 0 },
            ]
        },
        {
            Fee: 20, Discount: 7, Tax: 7, Amount: 200, ObjectState: 'None', AllowedAmount: 10,
            InsuranceEstimates: [
                { EstInsurance: 12, AdjEst: 5, PaidAmount: 0 },
                { EstInsurance: 9, AdjEst: 4, PaidAmount: 0 },
            ]
        },

    ];

    describe('EncounterTotalAmountPipe', () => {
        it('create an instance', () => {
            const pipe = new EncounterTotalAmountPipe();
            expect(pipe).toBeTruthy();
        });

        it('should add amount correctly', () => {
            const pipe = new EncounterTotalAmountPipe();
            const result = pipe.transform(services);            
            expect(result).toBe(300);
        });
    });

    describe('EncounterTotalAllowedAmountPipe', () => {
        it('create an instance', () => {
            const pipe = new EncounterTotalAllowedAmountPipe();
            expect(pipe).toBeTruthy();
        });

        it('should add amount correctly', () => {
            const pipe = new EncounterTotalAllowedAmountPipe();
            const result = pipe.transform(services);
            expect(result).toBe(13);
        });
    });

    describe('EncounterTotalTaxPipe', () => {
        it('create an instance', () => {
            const pipe = new EncounterTotalTaxPipe();
            expect(pipe).toBeTruthy();
        });

        it('should add tax correctly', () => {
            const pipe = new EncounterTotalTaxPipe();
            const result = pipe.transform(services);            
            expect(result).toBe(13);
        });
    });


    describe('EncounterTotalDiscountPipe', () => {
        it('create an instance', () => {
            const pipe = new EncounterTotalDiscountPipe();
            expect(pipe).toBeTruthy();
        });

        it('should add discount correctly', () => {
            const pipe = new EncounterTotalDiscountPipe();
            const result = pipe.transform(services);
            expect(result).toBe(12);
        });
    });


    describe('EncounterTotalFeePipe', () => {
        it('create an instance', () => {
            const pipe = new EncounterTotalFeePipe();
            expect(pipe).toBeTruthy();
        });

        it('should add fee correctly', () => {
            const pipe = new EncounterTotalFeePipe();
            const result = pipe.transform(services);
            expect(result).toBe(35);
        });
    });


    describe('EncounterTotalAdjEstPipe', () => {
        it('create an instance', () => {
            const pipe = new EncounterTotalAdjEstPipe();
            expect(pipe).toBeTruthy();
        });

        it('should add adj est correctly', () => {
            const pipe = new EncounterTotalAdjEstPipe();
            const result = pipe.transform(services);
            expect(result).toBe(22);
        });
    });


    describe('EncounterTotalEstinsPipe', () => {
        it('create an instance', () => {
            const pipe = new EncounterTotalEstinsPipe();
            expect(pipe).toBeTruthy();
        });

        it('should add est ins correctly', () => {
            const pipe = new EncounterTotalEstinsPipe();
            const result = pipe.transform(services);
            expect(result).toBe(40);
        });
    });



    describe('EncounterTotalPatientPortionPipe', () => {
        it('create an instance', () => {
            const pipe = new EncounterTotalPatientPortionPipe();
            expect(pipe).toBeTruthy();
        });

        it('should add patient portion correctly', () => {
            const pipe = new EncounterTotalPatientPortionPipe();
            const result = pipe.transform(services);
            expect(result).toBe(238);
        });
    });
});