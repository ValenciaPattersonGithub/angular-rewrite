import { TestBed } from '@angular/core/testing';

import { ScheduleDisplayPlannedServicesService } from './schedule-display-planned-services.service';


describe('ScheduleDisplayPlannedServicesService', () => {
    let service: ScheduleDisplayPlannedServicesService;

    const mockServiceCodes: any[] = [
        {
            ServiceCodeId: '1',
            DisplayAs: 'one',
        },
        {
            ServiceCodeId: '2',
            DisplayAs: 'two'

        },
        {
            ServiceCodeId: '3',
            Code: 'code three'
        }
    ];

    const mockPlannedServices: any[] = [
        {
            ServiceCodeId: '3',
            Tooth: '1'
        },
        {
            ServiceCodeId: '1',
            Surface: 'surf'
        },
        {
            ServiceCodeId: '0',
            Tooth: '2'
        },
        {
            ServiceCodeId: '2',
            Roots: 'roots'
        },
        {
            ServiceCodeId: '3',
            Surface: 'd,e,e,p'
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ScheduleDisplayPlannedServicesService]
        });
        service = TestBed.get(ScheduleDisplayPlannedServicesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('findByServiceCodeId should return null when serviceCodes list is null or undefined', () => {
        let localService = new ScheduleDisplayPlannedServicesService();
        localService.serviceCodes = null;

        const result = localService.findByServiceCodeId('ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25');
        expect(result).toEqual(null);
    });

    it('findByServiceCodeId should return ServiceCode when one is found', () => {
        service.serviceCodes = mockServiceCodes;

        const result = service.findByServiceCodeId('2');
        expect(result).toEqual(mockServiceCodes[1]);
    });

    it('findByServiceCodeId should return null when an ServiceCode is not found', () => {
        service.serviceCodes = mockServiceCodes;

        const result = service.findByServiceCodeId('stuff');
        expect(result).toEqual(null);
    });

    it('addSpacePrefixIfFirstParamHasAValue should return a value equal to the second parameter if the first parameter is null', () => {
        const resultValue = 'value';
        const result = service.addSpacePrefixIfFirstParamHasAValue(null, resultValue);
        expect(result).toEqual(resultValue);
    });

    it('addSpacePrefixIfFirstParamHasAValue should return a value equal to the second parameter if the first parameter is empty', () => {
        const resultValue = 'value';
        const result = service.addSpacePrefixIfFirstParamHasAValue('', resultValue);
        expect(result).toEqual(resultValue);
    });

    it('addSpacePrefixIfFirstParamHasAValue should return a value equal to the first and second parameter with a space between them if the first parameter is not empty', () => {
        const resultValue = 'value';
        const text = 'text';
        const result = service.addSpacePrefixIfFirstParamHasAValue('text', resultValue);
        expect(result).toEqual(text + ' ' + resultValue);
    });

    it('formatIndividualServiceText should return DisplayAs value when not empty or null and other values are not present', () => {
        const text = 'text';
        const plannedService = {};
        const serviceCode = {
            DisplayAs: text,
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual(text);
    });

    it('formatIndividualServiceText should return Code value when service DisplayAs value is null or empty and other values are not present', () => {
        const text = 'text';
        const plannedService = {};
        const serviceCodeOne = {
            DisplayAs: null,
            Code: text
        };
        const serviceCodeTwo = {
            DisplayAs: '',
            Code: text
        };
        const resultOne = service.formatIndividualServiceText(serviceCodeOne, plannedService);
        expect(resultOne).toEqual(text);

        const resultTwo = service.formatIndividualServiceText(serviceCodeTwo, plannedService);
        expect(resultTwo).toEqual(text);
    });

    it('formatIndividualServiceText should return tooth and DisplayAs values formatted correctly when Surface and Roots are not filled in', () => {
        const text = 'text';
        const plannedService = {
            Tooth: '1'
        };
        const serviceCode = {
            DisplayAs: text,
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 text');
    });

    it('formatIndividualServiceText should return Surface and Roots when they are populated with DisplayAs value', () => {
        const text = 'text';
        const plannedService = {
            Surface: '2',
            Roots: '3'
        };
        const serviceCode = {
            DisplayAs: text,
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('2 3 text');
    });

    it('formatIndividualServiceText should return Tooth, Surface, and Roots when they are populated with DisplayAs value', () => {
        const text = 'text';
        const plannedService = {
            Tooth: '1',
            Surface: '2',
            Roots: '3'
        };
        const serviceCode = {
            DisplayAs: text,
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 2 3 text');
    });

    it('formatIndividualServiceText should return Tooth, Surface, and Roots when they are populated with DisplayAs value replacing comma for surface with empty space', () => {
        const text = 'text';
        const plannedService = {
            Tooth: '1',
            Surface: 'M,I,',
            Roots: '3'
        };
        const serviceCode = {
            DisplayAs: text,
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 MI 3 text');
    });

    it('formatIndividualServiceText should return Tooth, Surface, and Roots when they are populated with DisplayAs value replacing comma for roots with empty space', () => {
        const text = 'text';
        const plannedService = {
            Tooth: '1',
            Surface: 'O',
            Roots: '4,3,'
        };
        const serviceCode = {
            DisplayAs: text,
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 O 43 text');
    });

    it('formatIndividualServiceText surfaces not be included original value is whitespace', () => {
        const plannedService = {
            Tooth: '1',
            Surface: '   '
        };
        const serviceCode = {
            DisplayAs: 'text',
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1  text');
    });

    it('formatIndividualServiceText surfaces should include original value if there are no commas', () => {
        const plannedService = {
            Tooth: '1',
            Surface: 'MODBB5LL5'
        };
        const serviceCode = {
            DisplayAs: 'text',
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 MODBB5LL5 text');
    });

    it('formatIndividualServiceText surfaces should replace original value in B clause', () => {
        const plannedService = {
            Tooth: '1',
            Surface: 'M,L,B5,L5'
        };
        const serviceCode = {
            DisplayAs: 'text',
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 MLB5 text');
    });

    it('formatIndividualServiceText surfaces should replace original value in F clause', () => {
        const plannedService = {
            Tooth: '1',
            Surface: 'I,F5,L5'
        };
        const serviceCode = {
            DisplayAs: 'text',
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 IFL5 text');
    });

    it('formatIndividualServiceText surfaces should replace original value in else clause', () => {
        const plannedService = {
            Tooth: '1',
            Surface: 'M,O,L,L5'
        };
        const serviceCode = {
            DisplayAs: 'text',
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 MOL5 text');
    });

    it('formatIndividualServiceText surfaces should replace original value in else clause', () => {
        const plannedService = {
            Tooth: '1',
            Surface: 'O,D,L,L5'
        };
        const serviceCode = {
            DisplayAs: 'text',
            Code: null
        };
        const result = service.formatIndividualServiceText(serviceCode, plannedService);
        expect(result).toEqual('#1 DOL5 text');
    });

    it('getSurfacesInSummaryFormat should return empty string if service does not have surfaces', () => {
        let result = service.getSurfacesInSummaryFormat(null);
        expect(result).toEqual('');

        result = service.getSurfacesInSummaryFormat(undefined);
        expect(result).toEqual('');
    });

    it('buildSingleServiceDisplayTextAndAmount should update nothing if service is not found', () => {
        var plannedService = {
            ServiceCodeId: '1',
            Surface: 'surf',
            Fee: 30
        };

        const appointment: any = {
            amount: 0
        };

        const result = service.buildSingleServiceDisplayTextAndAmount(appointment, plannedService);
        expect(result).toEqual(appointment);
    });

    it('buildSingleServiceDisplayTextAndAmount should update amount, add to concatinatedServices, and add to initialServiceCodes collection', () => {
        var plannedService = {
            ServiceCodeId: '1',
            Surface: 'surf',
            Fee: 30
        };

        const appointment: any = {
            amount: 0,
            concatinatedServices: '',
            initialServiceCodes: []
       
        };
        service.serviceCodes = mockServiceCodes;
        const result = service.buildSingleServiceDisplayTextAndAmount(appointment, plannedService);
        expect(result.amount).toEqual(30);
        expect(result.concatinatedServices).toEqual('surf one');
        expect(result.initialServiceCodes).toEqual([ { ServiceCodeId: '1', DisplayAs: 'one', displayName: 'surf one' } ]);
    });

    it('setAppointmentServiceDisplayTextAndAmount should update amount, concatinatedServices, and initialServiceCodes when multiple plannedServices', () => {
        const appointment: any = {
        }

        const plannedServices: any[] = [
            {
                ServiceCodeId: '3',
                Tooth: '1'
            },
            {
                ServiceCodeId: '1',
                Surface: 'surf',
                Fee: 30
            }
        ];

        const result = service.setAppointmentServiceDisplayTextAndAmount(appointment, plannedServices, mockServiceCodes);
        expect(result.amount).toEqual(30);
        expect(result.concatinatedServices).toEqual('#1 code three, surf one');
        expect(result.initialServiceCodes.length).toEqual(2)
    });

    it('setAppointmentServiceDisplayTextAndAmount should update amount and set it to zero if there are no services and appointmentType is null', () => {
    
        const appointment: any = {
            AppointmentType: null
        }

        const result = service.setAppointmentServiceDisplayTextAndAmount(appointment, null, mockServiceCodes);
        expect(result.amount).toEqual(0);
    });

    it('setAppointmentServiceDisplayTextAndAmount should update amount and set it to zero if there are no services and appointmentType usualAmount is zero', () => {

        const appointment: any = {
            AppointmentType: {
                UsualAmount: 0
            }
        }

        const result = service.setAppointmentServiceDisplayTextAndAmount(appointment, null, mockServiceCodes);
        expect(result.amount).toEqual(0);
    });

    it('setAppointmentServiceDisplayTextAndAmount should update amount and set it to ten if plannedServices are null and appointmentType usualAmount is ten', () => {

        const appointment: any = {
            AppointmentType: {
                UsualAmount: 10
            }
        }

        const result = service.setAppointmentServiceDisplayTextAndAmount(appointment, null, mockServiceCodes);
        expect(result.amount).toEqual(10);
    });

    it('setAppointmentServiceDisplayTextAndAmount should update amount and set it to ten if plannedServices are empty and appointmentType usualAmount is ten', () => {

        const appointment: any = {
            AppointmentType: {
                UsualAmount: 10
            },
            PlannedServices: []
        }

        const result = service.setAppointmentServiceDisplayTextAndAmount(appointment, null, mockServiceCodes);
        expect(result.amount).toEqual(10);
    });

    it('setAppointmentServiceDisplayTextAndAmount should return amount and set it to zero if there are services but they have no fees', () => {
        const appointment: any = {
        }

        const plannedServices: any[] = [
            {
                ServiceCodeId: '3',
                Tooth: '1',
                Fee: 0
            },
            {
                ServiceCodeId: '1',
                Surface: 'surf',
                Fee: 0
            }
        ];

        const result = service.setAppointmentServiceDisplayTextAndAmount(appointment, plannedServices, mockServiceCodes);
        expect(result.amount).toEqual(0);
    });
});