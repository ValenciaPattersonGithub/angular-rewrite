import { TestBed } from '@angular/core/testing';

import { AppointmentType } from '../appointment-types/appointment-type';

import { AppointmentTypesService } from './appointment-types.service';
import { ColorUtilitiesService } from '../common/providers/color-utilities.service';

describe('AppointmentTypesService', () => {
    let service: AppointmentTypesService;

    const mockColorUtilitiesService: ColorUtilitiesService = new ColorUtilitiesService();

    const mockTypes: AppointmentType[] = [
        {
            AppointmentTypeColor: '#FFa980',
            AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
            DataTag: 'AAAAAAAACBc=',
            DateModified: new Date('2017-08-08T20:01:40.8482927'),
            DefaultDuration: 30,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Consultation',
            PerformedByProviderTypeId: 1,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        },
        {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 90,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        }
    ];

    const mockAppointmentTypesService = new AppointmentTypesService(mockColorUtilitiesService);
    mockAppointmentTypesService.appointmentTypes = mockTypes;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AppointmentTypesService, useValue: mockAppointmentTypesService },
                { provide: ColorUtilitiesService, useValue: mockColorUtilitiesService }
            ]
        });
        service = TestBed.get(AppointmentTypesService);
    }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('findByAppointmentTypeId should return null when appointmentTypes list is null or undefined', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = null;

        const result = localService.findByAppointmentTypeId('ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25');
        expect(result).toEqual(null);
    });

    it('findByAppointmentTypeId should return AppointmentType when one is found', () => {
        const result = service.findByAppointmentTypeId('ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25');
        expect(result).toEqual(mockTypes[1]);
    });

    it('findByAppointmentTypeId should return null when an AppointmentType is not found', () => {
        const result = service.findByAppointmentTypeId('stuff');
        expect(result).toEqual(null);
    });

    it('findByName should return null when appointmentTypes list is null or undefined', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = null;

        const result = localService.findByName('Consultation1');
        expect(result).toEqual(null);
    });

    it('findByName should return AppointmentType when one is found', () => {
        const result = service.findByName('Crown Bridge Prep');
        expect(result).toEqual(mockTypes[1]);
    });

    it('findByName should return null when an AppointmentType is not found', () => {
        const result = service.findByName('Consultation1');
        expect(result).toEqual(null);
    });

    it('getAppointmentTypeColors should return baseRgb with type fontColor values when appointment is completed and type selected', () => {
        const expectedResult = {
            Display: 160 + ', ' + 160 + ', ' + 160,
            Font: mockTypes[0].FontColor
        };
        // type and status
        const result = service.getAppointmentTypeColors(mockTypes[0], 3);
        expect(result).toEqual(expectedResult);
    });

    it('getAppointmentTypeColors should return baseRgb with standard fontColor value when appointment is completed and type is not selected', () => {
        const expectedResult = {
            Display: 160 + ', ' + 160 + ', ' + 160,
            Font: '#000'
        };
        // type and status
        const result = service.getAppointmentTypeColors(null, 3);
        expect(result).toEqual(expectedResult);
    });

    it('getAppointmentTypeColors should return hundreds Rgb values with standard fontColor value when appointment is not completed and type is not selected', () => {
        const expectedResult = {
            Display: 100 + ', ' + 100 + ', ' + 100,
            Font: '#000'
        };
        // type and status
        const result = service.getAppointmentTypeColors(null, 2);
        expect(result).toEqual(expectedResult);
    });

    it('getAppointmentTypeColors should return type Rgb values and type fontColor value when appointment is not completed and type selected', () => {
        const expectedResult = {
            Display: 255 + ', ' + 169 + ', ' + 128,
            Font: '#000000'
        };
        // type and status
        const result = service.getAppointmentTypeColors(mockTypes[0], 2);
        expect(result).toEqual(expectedResult);
    });

    it('getAppointmentTypeColors should return noColor value with standard fontColor value when appointment is not completed and type color is null', () => {
        const expectedResult = {
            Display: 100 + ', ' + 100 + ', ' + 100,
            Font: '#000'
        };
        const appType = {
            AppointmentTypeColor: null,
            AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
            DataTag: 'AAAAAAAACBc=',
            DateModified: new Date('2017-08-08T20:01:40.8482927'),
            DefaultDuration: 30,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Consultation',
            PerformedByProviderTypeId: 1,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };
        // type and status
        const result = service.getAppointmentTypeColors(appType, 2);
        expect(result).toEqual(expectedResult);
    });

    it('getAppointmentTypeColors should return baseRgb value with standard fontColor value when appointment is completed and type color is null', () => {
        const expectedResult = {
            Display: 160 + ', ' + 160 + ', ' + 160,
            Font: '#000'
        };
        const appType = {
            AppointmentTypeColor: null,
            AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
            DataTag: 'AAAAAAAACBc=',
            DateModified: new Date('2017-08-08T20:01:40.8482927'),
            DefaultDuration: 30,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Consultation',
            PerformedByProviderTypeId: 1,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };
        // type and status
        const result = service.getAppointmentTypeColors(appType, 3);
        expect(result).toEqual(expectedResult);
    });

    it('getAppointmentTypeColors should return baseRgb value with standard fontColor value when appointment is completed and type color is empty', () => {
        const expectedResult = {
            Display: 160 + ', ' + 160 + ', ' + 160,
            Font: '#000'
        };
        const appType = {
            AppointmentTypeColor: '',
            AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
            DataTag: 'AAAAAAAACBc=',
            DateModified: new Date('2017-08-08T20:01:40.8482927'),
            DefaultDuration: 30,
            FontColor: '#000000',
            Name: 'Consultation',
            PerformedByProviderTypeId: 1,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };
        // type and status
        const result = service.getAppointmentTypeColors(appType, 3);
        expect(result).toEqual(expectedResult);
    });

    it('setAppointmentTypeWithBaseColorsAndStyles should add several values to the appointment', () => {
        const appointment: any = {
            AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
            Status: 2
        };

        const expectedColor = {
            Display: 255 + ', ' + 169 + ', ' + 128,
            Font: '#000000'
        };

        const expectedResult: any = {
            AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
            Status: 2,
            AppointmentType: mockTypes[0],
            typeColor: expectedColor,
            patientNameTypeColor: 'background-color: rgba(255, 169, 128, 1.0)',
            cardStyle: 'border-radius: 0, border: none, background-color: rgba(255, 169, 128, 0.35),color: #000000, overflow: visible'
        };

        // type and status
        const result = service.setAppointmentTypeWithBaseColorsAndStyles(appointment);
        expect(result).toEqual(expectedResult);
    });

    it('getFormattedDuration should convert number 5 into formatted text 0:05', () => {
        let result = service.getFormattedDuration(5);
        expect(result).toEqual('0:05');
    });

    it('getFormattedDuration should convert number 90 into formatted text 1:30', () => {
        let result = service.getFormattedDuration(90);
        expect(result).toEqual('1:30');
    });

    it('getFormattedDuration should convert number 60 into formatted text 1:00', () => {
        let result = service.getFormattedDuration(60);
        expect(result).toEqual('1:00');
    });

    it('setAppointmentTypes should not populate the list of appiontmentTypes if value sent is null', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = null;

        let result = localService.setAppointmentTypes(null);

        expect(localService.appointmentTypes).toEqual(null);
    });

    it('setAppointmentTypes should populate the list of appiontmentTypes and set Formatted Duration', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = null;

        const types: AppointmentType[] = [
            {
                AppointmentTypeColor: '',
                AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
                DataTag: 'AAAAAAAACBc=',
                DateModified: new Date('2017-08-08T20:01:40.8482927'),
                DefaultDuration: 0,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Consultation',
                PerformedByProviderTypeId: 1,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            },
            {
                AppointmentTypeColor: '#FFFF00',
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                DataTag: 'AAAAAAAACCM=',
                DateModified: new Date('2017-08-08T20:01:41.0536635'),
                DefaultDuration: 90,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Crown Bridge Prep',
                PerformedByProviderTypeId: 2,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            }
        ];

        const expectedTypes: AppointmentType[] = [
            {
                AppointmentTypeColor: '',
                AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
                DataTag: 'AAAAAAAACBc=',
                DateModified: new Date('2017-08-08T20:01:40.8482927'),
                DefaultDuration: 0,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Consultation',
                PerformedByProviderTypeId: 1,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            },
            {
                AppointmentTypeColor: '#FFFF00',
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                DataTag: 'AAAAAAAACCM=',
                DateModified: new Date('2017-08-08T20:01:41.0536635'),
                DefaultDuration: 90,
                FormattedDuration: '1:30',
                FontColor: '#000000',
                Name: 'Crown Bridge Prep',
                PerformedByProviderTypeId: 2,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            }
        ];

        let result = localService.setAppointmentTypes(types);

        expect(localService.appointmentTypes).toEqual(expectedTypes);
    });

    it('addAppointmentType should return added AppointmentType with formattedDuration if appointmentTypes list is null', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = null;

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 90,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        const resultExpected: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 90,
            FormattedDuration: '1:30',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.addAppointmentType(type);
        expect(result).toEqual(resultExpected);
    });

    it('addAppointmentType should return item if appointmentType already in the collection', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = [
            {
                AppointmentTypeColor: '#FFFF00',
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                DataTag: 'AAAAAAAACCM=',
                DateModified: new Date('2017-08-08T20:01:41.0536635'),
                DefaultDuration: 90,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Crown Bridge Prep',
                PerformedByProviderTypeId: 2,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            }
        ];

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 90,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.addAppointmentType(type);
        expect(result).toEqual(type);
    });


    it('updateAppointmentType should return null if appointmentType collection is null', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = null

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 60,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.updateAppointmentType(type);
        expect(result).toEqual(null);
    });

    it('updateAppointmentType should return null if appointmentType not in collection', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = [
            {
                AppointmentTypeColor: '#FFFF00',
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                DataTag: 'AAAAAAAACCM=',
                DateModified: new Date('2017-08-08T20:01:41.0536635'),
                DefaultDuration: 90,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Crown Bridge Prep',
                PerformedByProviderTypeId: 2,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            }
        ];

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'dd6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 60,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.updateAppointmentType(type);
        expect(result).toEqual(null);
    });

    it('updateAppointmentType should return appointmentType if appointmentType already in the collection', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = [
            {
                AppointmentTypeColor: '#FFFF00',
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                DataTag: 'AAAAAAAACCM=',
                DateModified: new Date('2017-08-08T20:01:41.0536635'),
                DefaultDuration: 90,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Crown Bridge Prep',
                PerformedByProviderTypeId: 2,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            }
        ];

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 60,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        const resultExpected: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 60,
            FormattedDuration: '1:00',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.updateAppointmentType(type);
        expect(result).toEqual(resultExpected);
    });

    it('removeAppointmentType should remove appointmentType, if appointmentType exists in the collection and collection has one value', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = [
            {
                AppointmentTypeColor: '#FFFF00',
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                DataTag: 'AAAAAAAACCM=',
                DateModified: new Date('2017-08-08T20:01:41.0536635'),
                DefaultDuration: 90,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Crown Bridge Prep',
                PerformedByProviderTypeId: 2,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            }
        ];

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 60,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.removeAppointmentType(type);
        expect(0).toEqual(localService.appointmentTypes.length);
    });


    it('removeAppointmentType should remove appointmentType, if appointmentType exists in the collection and collection has many values', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = [
            {
                AppointmentTypeColor: '',
                AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
                DataTag: 'AAAAAAAACBc=',
                DateModified: new Date('2017-08-08T20:01:40.8482927'),
                DefaultDuration: 0,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Consultation',
                PerformedByProviderTypeId: 1,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            },
            {
                AppointmentTypeColor: '#FFFF00',
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                DataTag: 'AAAAAAAACCM=',
                DateModified: new Date('2017-08-08T20:01:41.0536635'),
                DefaultDuration: 90,
                FormattedDuration: '1:30',
                FontColor: '#000000',
                Name: 'Crown Bridge Prep',
                PerformedByProviderTypeId: 2,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            }
        ];

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 60,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.removeAppointmentType(type);
        expect(1).toEqual(localService.appointmentTypes.length);
    });


    it('removeAppointmentType should not remove appointmentType, if collection is empty', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = [];

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'db6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 60,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.removeAppointmentType(type);
        expect(0).toEqual(localService.appointmentTypes.length);
    });

    it('removeAppointmentType should not remove appointmentType, if appointmentType does not exists in the collection', () => {
        let localService = new AppointmentTypesService(mockColorUtilitiesService);
        localService.appointmentTypes = [
            {
                AppointmentTypeColor: '#FFFF00',
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                DataTag: 'AAAAAAAACCM=',
                DateModified: new Date('2017-08-08T20:01:41.0536635'),
                DefaultDuration: 90,
                FormattedDuration: '',
                FontColor: '#000000',
                Name: 'Crown Bridge Prep',
                PerformedByProviderTypeId: 2,
                UpdatesNextPreventiveAppointmentDate: false,
                UserModified: '00000000-0000-0000-0000-000000000000',
                UsualAmount: null
            }
        ];

        const type: AppointmentType = {
            AppointmentTypeColor: '#FFFF00',
            AppointmentTypeId: 'db6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            DataTag: 'AAAAAAAACCM=',
            DateModified: new Date('2017-08-08T20:01:41.0536635'),
            DefaultDuration: 60,
            FormattedDuration: '',
            FontColor: '#000000',
            Name: 'Crown Bridge Prep',
            PerformedByProviderTypeId: 2,
            UpdatesNextPreventiveAppointmentDate: false,
            UserModified: '00000000-0000-0000-0000-000000000000',
            UsualAmount: null
        };

        let result = localService.removeAppointmentType(type);
        expect(1).toEqual(localService.appointmentTypes.length);
    });

});
