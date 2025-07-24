import { TestBed } from '@angular/core/testing';

import { TreatmentPlanOrderingService } from './treatment-plan-ordering.service';


describe('TreatmentPlanOrderingService', () => {
    let service: TreatmentPlanOrderingService;

    const descriptionList = [
        { Description: '4' },
        { Description: 'cf' },
        { Description: 'ab' },
        { Description: '2' }
    ];

    const descriptionListAscending = [
        { Description: '2' },
        { Description: '4' },
        { Description: 'ab' },
        { Description: 'cf' }
    ];

    const descriptionListDescending = [
        { Description: 'cf' },
        { Description: 'ab' },
        { Description: '4' },
        { Description: '2' }
    ];

    const serviceToothList = [
        {
            ServiceTransaction: {
                Tooth: '6'
            }
        },
        {
            ServiceTransaction: {
                Tooth: 'ac'
            }
        },
        {
            ServiceTransaction: {
                Tooth: 'ca'
            }
        },
        {
            ServiceTransaction: {
                Tooth: '30'
            }
        },
        {
            ServiceTransaction: {
                Tooth: '1'
            }
        },
    ];

    const serviceToothWithoutToothList = [
        {
            ServiceTransaction: { }
        },
        {
            ServiceTransaction: { }
        },
        {
            ServiceTransaction: { }
        },
        {
            ServiceTransaction: { }
        },
    ];

    const serviceToothListAscending = [
        {
            ServiceTransaction: {
                Tooth: '1'
            }
        },
        {
            ServiceTransaction: {
                Tooth: '6'
            }
        },
        {
            ServiceTransaction: {
                Tooth: '30'
            }
        },
        {
            ServiceTransaction: {
                Tooth: 'ac'
            }
        },
        {
            ServiceTransaction: {
                Tooth: 'ca'
            }
        }
    ];

    const serviceToothListDescending = [
        {
            ServiceTransaction: {
                Tooth: 'ca'
            }
        },
        {
            ServiceTransaction: {
                Tooth: 'ac'
            }
        },
        {
            ServiceTransaction: {
                Tooth: '30'
            }
        },
        {
            ServiceTransaction: {
                Tooth: '6'
            }
        },
        {
            ServiceTransaction: {
                Tooth: '1'
            }
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TreatmentPlanOrderingService]
        });
        service = TestBed.get(TreatmentPlanOrderingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('orderServiceTypesByDescription when list is null', () => {
        const result = service.orderServiceTypesByDescription(null, true);
        expect(result).toEqual(null);
    });

    it('orderServiceTypesByDescription orders the list of items by description ascending', () => {
        const result = service.orderServiceTypesByDescription(descriptionList, true);
        expect(result).toEqual(descriptionListAscending);
    });

    it('orderServiceTypesByDescription orders the list of items by description descending', () => {
        const result = service.orderServiceTypesByDescription(descriptionList, false);
        expect(result).toEqual(descriptionListDescending);
    });

    it('orderNumberAndStringListByNestedParameter when list is null', () => {
        const result = service.orderNumberAndStringListByNestedParameter(null, 'x', 'x', true);
        expect(result).toEqual(null);
    });

    it('orderNumberAndStringListByNestedParameter when nested property does not exist', () => {
        const result = service.orderNumberAndStringListByNestedParameter(serviceToothWithoutToothList, 'ServiceTransaction', 'Tooth', true);
        expect(result).toEqual(serviceToothWithoutToothList);
    });

    it('orderNumberAndStringListByNestedParameter orders the list of items by serviceTransaction tooth ascending', () => {
        const result = service.orderNumberAndStringListByNestedParameter(serviceToothList, 'ServiceTransaction', 'Tooth', true);
        expect(result).toEqual(serviceToothListAscending);
    });

    it('orderNumberAndStringListByNestedParameter orders the list of items by serviceTransaction tooth descending', () => {
        const result = service.orderNumberAndStringListByNestedParameter(serviceToothList, 'ServiceTransaction', 'Tooth', false);
        expect(result).toEqual(serviceToothListDescending);
    });

    it('orderItems returns the same position value that was provided when first param is null or undefined', () => {
        const resultOne = service.orderItems(null, '1', 1);
        expect(resultOne).toEqual(1);
        const resultTwo = service.orderItems(undefined, '1', 1);
        expect(resultTwo).toEqual(1);
    });

    it('orderItems returns opposite position value then what was provided when second param is null or undefined', () => {
        const resultOne = service.orderItems('1', null, 1);
        expect(resultOne).toEqual(-1);
        const resultTwo = service.orderItems('1', undefined, 1);
        expect(resultTwo).toEqual(-1);
    });

    it('orderItems returns the same position value that was provided when first param is greater then the second param', () => {
        const resultOne = service.orderItems('1', '2', 1);
        expect(resultOne).toEqual(-1);
        const resultTwo = service.orderItems('ab', 'bc', 1);
        expect(resultTwo).toEqual(-1);
    });

    it('orderItems returns the opposite position value that what was provided when first param is less then the second param', () => {
        const resultOne = service.orderItems('2', '1', 1);
        expect(resultOne).toEqual(1);
        const resultTwo = service.orderItems('bc', 'ab', 1);
        expect(resultTwo).toEqual(1);
    });


});
