import { TestBed } from '@angular/core/testing';

import { AppointmentModalProvidersService } from './appointment-modal-providers.service';


describe('ScheduleProvidersService', () => {
    let service: AppointmentModalProvidersService;

    const mockProviders: any[] = [
        {
            UserId: '33809683-e1b2-416a-a612-ef385d796f30',
            UserCode: 'NothingOne',
            Name: 'NothingOne'
        },
        {
            UserId: '45809683-e1b2-416a-a612-ef385d796f30',
            UserCode: 'NothingTwo',
            Name: null
        },
        {
            UserId: '67899683-e1b2-416a-a612-ef385d796f30',
            UserCode: 'NothingThree',
            Name: undefined
        }
    ];
    const defaultEmptyText = 'empty';
    const mockScheduleProvidersService = new AppointmentModalProvidersService();
    mockScheduleProvidersService.modalProviders = mockProviders;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AppointmentModalProvidersService, useValue: mockScheduleProvidersService }
            ]
        });
        service = TestBed.get(AppointmentModalProvidersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('findByUserId should return null when providers list is null or undefined', () => {
        let localService = new AppointmentModalProvidersService();
        localService.modalProviders = null;

        const result = localService.findByUserId('stuff');
        expect(result).toEqual(null);
    });

    it('findByUserId should return Provider when one is found', () => {
        const result = service.findByUserId('67899683-e1b2-416a-a612-ef385d796f30');
        expect(result).toEqual(mockProviders[2]);
    });

    it('findByUserId should return null when an Provider is not found', () => {
        const result = service.findByUserId('stuff');
        expect(result).toEqual(null);
    });

    it('findByUserCode should return null when providers list is null or undefined', () => {
        let localService = new AppointmentModalProvidersService();
        localService.modalProviders = null;

        const result = localService.findByUserCode('stuff');
        expect(result).toEqual(null);
    });

    it('findByUserCode should return Provider when one is found', () => {
        const result = service.findByUserCode('NothingTwo');
        expect(result).toEqual(mockProviders[1]);
    });

    it('findByUserCode should return null when an Provider is not found', () => {
        const result = service.findByUserCode('stuff');
        expect(result).toEqual(null);
    });

    it('findAndformatProviderName should return provided defaultEmptyText if provider not found', () => {
        const result = service.findAndformatProviderName('stuff', defaultEmptyText);
        expect(result).toEqual(defaultEmptyText);
    });

    it('findAndformatProviderName should return provided defaultEmptyText if provider found but name is null or undefined', () => {
        const result1 = service.findAndformatProviderName('45809683-e1b2-416a-a612-ef385d796f30', defaultEmptyText);
        expect(result1).toEqual(defaultEmptyText);

        const result2 = service.findAndformatProviderName('67899683-e1b2-416a-a612-ef385d796f30', defaultEmptyText);
        expect(result2).toEqual(defaultEmptyText);
    });

    it('findAndformatProviderName should return provider name if provider found and name is populated', () => {
        const result = service.findAndformatProviderName('33809683-e1b2-416a-a612-ef385d796f30', defaultEmptyText);
        expect(result).toEqual('NothingOne');
    });
});