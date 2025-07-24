import { ServiceTotalEstinsPipe, ServiceAdjEstPipe } from 'src/@shared/pipes/service/service-totals.pipe';

describe('serviceTotalsPipes', function () {
    var services: any[];
    services = [
        {
            Fee: 10, Discount: 10, Tax: 5, Amount: 50, ObjectState: 'Delete',
            InsuranceEstimates: [
                { EstInsurance: 10, AdjEst: 9, PaidAmount: 0 },
                { EstInsurance: 7, AdjEst: 8, PaidAmount: 0 },
            ]
        },
        {
            Fee: 15, Discount: 5, Tax: 6, Amount: 100, ObjectState: 'Add',
            InsuranceEstimates: [
                { EstInsurance: 11, AdjEst: 7, PaidAmount: 0 },
                { EstInsurance: 8, AdjEst: 6, PaidAmount: 0 },
            ]
        },
        {
            Fee: 20, Discount: 7, Tax: 7, Amount: 200, ObjectState: 'None',
            InsuranceEstimates: [
                { EstInsurance: 12, AdjEst: 5, PaidAmount: 0 },
                { EstInsurance: 9, AdjEst: 4, PaidAmount: 0 },
            ]
        },
        {
            Fee: 20, Discount: 7, Tax: 7, Amount: 300, ObjectState: 'Add',
            InsuranceEstimates: []
        },
    ];

    describe('ServiceTotalEstinsPipe', () => {
        it('create an instance', () => {
            const pipe = new ServiceTotalEstinsPipe();
            expect(pipe).toBeTruthy();
        });

        it('should handle delete correctly', () => {
            const pipe = new ServiceTotalEstinsPipe();
            const result = pipe.transform(services[0]);
            expect(result).toBe(0);
        });

        it('should add est ins correctly', () => {
            const pipe = new ServiceTotalEstinsPipe();
            const result = pipe.transform(services[1]);
            expect(result).toBe(19);
        });

        it('should handle empty InsuranceEstimates correctly', () => {
            const pipe = new ServiceTotalEstinsPipe();
            const result = pipe.transform(services[3]);
            expect(result).toBe(0);
        });
    });

    describe('ServiceAdjEstPipe', () => {
        it('create an instance', () => {
            const pipe = new ServiceAdjEstPipe();
            expect(pipe).toBeTruthy();
        });

        it('should handle delete correctly', () => {
            const pipe = new ServiceAdjEstPipe();
            const result = pipe.transform(services[0]);
            expect(result).toBe(0);
        });

        it('should add adj est correctly', () => {
            const pipe = new ServiceAdjEstPipe();
            const result = pipe.transform(services[1]);
            expect(result).toBe(13);
        });

        it('should handle empty InsuranceEstimates correctly', () => {
            const pipe = new ServiceTotalEstinsPipe();
            const result = pipe.transform(services[3]);
            expect(result).toBe(0);
        });
    });
});