import { TestBed } from '@angular/core/testing';
import { RoomsService } from '../../practices/providers/rooms.service';
import { LocationTimeService } from '../../practices/common/providers/location-time.service';
import { TimezoneDataService } from "../../practices/common/providers/timezone-data.service";
import { LocationsService } from '../../practices/providers/locations.service';
import { AppointmentType } from '../appointment-types/appointment-type';
import { ColorUtilitiesService } from '../common/providers/color-utilities.service';
import { AppointmentTypesService } from '../appointment-types/appointment-types.service';
import { ScheduleDisplayPatientService } from '../common/providers/schedule-display-patient.service';
import { ScheduleDisplayPlannedServicesService } from '../common/providers/schedule-display-planned-services.service';
import { ScheduleProvidersService } from '../common/providers/schedule-providers.service';
import { PinnedAppointmentsService } from './pinned-appointments.service';

describe('PinnedAppointmentsService', () => {
    let service: PinnedAppointmentsService;
    let mockTypes: AppointmentType[];
    let mockRoomsService: RoomsService;
    let mockTimezoneDataService: TimezoneDataService;
    let mockLocationTimeService: LocationTimeService;
    let mockLocationsService: LocationsService;
    let mockColorUtilitiesService: ColorUtilitiesService;
    let mockAppointmentTypesService: AppointmentTypesService;
    let mockScheduleDisplayPatientService: ScheduleDisplayPatientService;
    let mockScheduleDisplayPlannedServicesService: ScheduleDisplayPlannedServicesService;
    let mockScheduleProvidersService: ScheduleProvidersService;
    let mockPinnedAppointments: any[];
    let idList;
    let mockPinnedAppointmentsService;

    beforeEach(() => {
        mockTypes = [
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
        mockRoomsService = new RoomsService();

        mockTimezoneDataService = new TimezoneDataService();
        mockLocationTimeService = new LocationTimeService(mockTimezoneDataService);
        mockLocationsService = new LocationsService();

        mockColorUtilitiesService = new ColorUtilitiesService();
        mockAppointmentTypesService = new AppointmentTypesService(mockColorUtilitiesService);
        mockAppointmentTypesService.appointmentTypes = mockTypes;

        mockScheduleDisplayPatientService = new ScheduleDisplayPatientService();
        mockScheduleDisplayPlannedServicesService = new ScheduleDisplayPlannedServicesService();
        mockScheduleProvidersService = new ScheduleProvidersService();

        mockPinnedAppointments = [
            {
                AppointmentId: '33809683-e1b2-416a-a612-ef385d796f30',
                LocationId: 2,
                IsPinned: true,
                Classification: 2,
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                AppointmentType: null
            },
            {
                AppointmentId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                LocationId: 2,
                IsPinned: true,
                Classification: 2,
                AppointmentTypeId: '33809683-e1b2-416a-a612-ef385d796f30',
                AppointmentType: null
            },
            {
                AppointmentId: '34556783-e1b2-416a-a612-ef0392896f30',
                LocationId: 1,
                IsPinned: true,
                Classification: 2,
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                AppointmentType: null
            },
        ];

        idList = [2];

        mockPinnedAppointmentsService = new PinnedAppointmentsService(
            mockRoomsService, mockLocationsService, mockAppointmentTypesService, mockScheduleDisplayPatientService,
            mockScheduleDisplayPlannedServicesService, mockScheduleProvidersService);
        mockPinnedAppointmentsService.allPinnedAppointments = mockPinnedAppointments;

        TestBed.configureTestingModule({
            providers: [
                { provide: PinnedAppointmentsService, useValue: mockPinnedAppointmentsService },
                { provide: RoomsService, userValue: mockRoomsService },
                { provide: LocationsService, userValue: mockLocationsService },
                { provide: LocationTimeService, useValue: mockLocationTimeService },
                { provide: TimezoneDataService, useValue: mockTimezoneDataService },
                { provide: AppointmentTypesService, userValue: mockAppointmentTypesService },
                { provide: ColorUtilitiesService, userValue: mockColorUtilitiesService },
                { provide: ScheduleDisplayPatientService, userValue: mockScheduleDisplayPatientService },
                { provide: ScheduleDisplayPlannedServicesService, userValue: mockScheduleDisplayPlannedServicesService },
                { provide: ScheduleProvidersService, userValue: mockScheduleProvidersService }
            ]
        });
        service = TestBed.get(PinnedAppointmentsService);
    }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('findIndexOfAppointmentId should return negative one when appPinnedAppointment list is null', () => {
        let localService = new PinnedAppointmentsService(mockRoomsService, mockLocationsService, mockAppointmentTypesService, mockScheduleDisplayPatientService,
            mockScheduleDisplayPlannedServicesService, mockScheduleProvidersService);
        localService.allPinnedAppointments = null;

        const result = localService.findIndexOfAppointmentId('34');
        expect(result).toEqual(-1);
    });

    it('findIndexOfAppointmentId should return negative one when appPinnedAppointment list is empty', () => {
        let localService = new PinnedAppointmentsService(mockRoomsService, mockLocationsService, mockAppointmentTypesService, mockScheduleDisplayPatientService,
            mockScheduleDisplayPlannedServicesService, mockScheduleProvidersService);
        localService.allPinnedAppointments = [];

        const result = localService.findIndexOfAppointmentId('34');
        expect(result).toEqual(-1);
    });

    it('findIndexOfAppointmentId should return negative one when searched for value is null', () => {
        let localService = new PinnedAppointmentsService(mockRoomsService, mockLocationsService, mockAppointmentTypesService, mockScheduleDisplayPatientService,
            mockScheduleDisplayPlannedServicesService, mockScheduleProvidersService);
        localService.allPinnedAppointments = null;

        const result = localService.findIndexOfAppointmentId(null);
        expect(result).toEqual(-1);
    });

    it('findIndexOfAppointmentId should return negative one when searched for value is not in list', () => {
        const result = service.findIndexOfAppointmentId('stuff');
        expect(result).toEqual(-1);
    });

    it('findIndexOfAppointmentId should return one when value is found', () => {
        const result = service.findIndexOfAppointmentId('ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25');
        expect(result).toEqual(1);
    });

    it('canAddToListCriteria should return false when IsPinned !== true', () => {
        // this will have to be updated once we remove the utilization of any as the first property type
        var tempObject = { IsPinned: false, Classification: 2 };
        const result = service.canAddToListCriteria(tempObject, '');
        expect(result).toEqual(false);
    });

    it('canAddToListCriteria should return false when Classification !== 2', () => {
        // this will have to be updated once we remove the utilization of any as the first property type
        var tempObject = { IsPinned: true, Classification: 1 };
        const result = service.canAddToListCriteria(tempObject, '');
        expect(result).toEqual(false);
    });

    it('canAddToListCriteria should return false when state === delete', () => {
        // this will have to be updated once we remove the utilization of any as the first property type
        var tempObject = { IsPinned: true, Classification: 2 };
        const result = service.canAddToListCriteria(tempObject, 'delete');
        expect(result).toEqual(false);
    });

    it('getPinnedAppointments should return empty list when id list is null', () => {
        const result = service.getPinnedAppointments(null);
        expect(result).toEqual([]);
    });

    it('getPinnedAppointments should return empty list when allPinnedAppointments is null', () => {
        let localService = new PinnedAppointmentsService(mockRoomsService, mockLocationsService, mockAppointmentTypesService, mockScheduleDisplayPatientService,
            mockScheduleDisplayPlannedServicesService, mockScheduleProvidersService);
        localService.allPinnedAppointments = null;

        const result = localService.getPinnedAppointments(idList);
        expect(result).toEqual([]);
    });

    it('getPinnedAppointments should return empty array when allPinnedAppointments is empty', () => {
        let localService = new PinnedAppointmentsService(mockRoomsService, mockLocationsService, mockAppointmentTypesService, mockScheduleDisplayPatientService,
            mockScheduleDisplayPlannedServicesService, mockScheduleProvidersService);
        localService.allPinnedAppointments = [];

        const result = localService.getPinnedAppointments(idList);
        expect(result).toEqual([]);
    });

    it('getPinnedAppointments should return empty array when no appointments in the selected locations', () => {
        let localService = new PinnedAppointmentsService(mockRoomsService, mockLocationsService, mockAppointmentTypesService, mockScheduleDisplayPatientService,
            mockScheduleDisplayPlannedServicesService, mockScheduleProvidersService);
        localService.allPinnedAppointments = [
            {
                AppointmentId: '33809683-e1b2-416a-a612-ef385d796f30',
                LocationId: 1,
                IsPinned: true
            }
        ];

        const result = localService.getPinnedAppointments(idList);
        expect(result).toEqual([]);
    });

    it('getPinnedAppointments should return two when appointments are pinned and in the same location', () => {
        const result = service.getPinnedAppointments(idList);
        expect(result.length).toEqual(2);
    });

    it('initializePinnedAppointmentsForSchedule should be empty list if passed parameter is null', () => {
        service.initializePinnedAppointmentsForSchedule(null, [], '', false);
        let result = service.allPinnedAppointments;
        expect(result).toEqual([]);
    });

    it('initializePinnedAppointmentsForSchedule should be empty list if passed parameter is []', () => {
        service.initializePinnedAppointmentsForSchedule([], [], '', false);
        let result = service.allPinnedAppointments;
        expect(result).toEqual([]);
    });

    it('initializePinnedAppointmentsForSchedule should be empty list if passed appointments not meeting the criteria of IsPinned and Classification of two', () => {
        let appts = [
            {
                AppointmentId: '33809683-e1b2-416a-a612-ef385d796f30',
                LocationId: 2,
                IsPinned: false,
                Classification: 1,
                AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
                AppointmentType: null
            }];

        service.initializePinnedAppointmentsForSchedule(appts, [], '', false);
        let result = service.allPinnedAppointments;
        expect(result).toEqual([]);
    });

    it('initializePinnedAppointmentsForSchedule should be three in length when passed correct values', () => {
        service.initializePinnedAppointmentsForSchedule(mockPinnedAppointments, [], '', false);
        let result = service.allPinnedAppointments;
        expect(result.length).toEqual(3);
    });

    it('transformSingleAppointmentForSchedule should return a bunch of empty values when data is not present in other services or in list provided', () => {
        let result = service.transformSingleAppointmentForSchedule(mockPinnedAppointments[0], [], '', false);

        // these test assume we are not expanding on the tests to check all conditions or populate all the services
        // individually we are only testing the empty or null cases expressed in the method.
        expect(result.Room).toEqual(null);
        expect(result.treatmentRoomName).toEqual('');
        expect(result.Location).toEqual(null);
        expect(result.locationName).toEqual('');
        expect(result.examiningDentistName).toEqual('');
        expect(result.providerName).toEqual('');
        expect(result.patientName).toEqual('');
        expect(result.patientCode).toEqual('');
    });

    it('transformSingleAppointmentForSchedule should return patientCode when schedule is in privacy mode and patient record is not null', () => {
        const localMockPinnedAppointments: any = {
            AppointmentId: '33809683-e1b2-416a-a612-ef385d796f30',
            LocationId: 2,
            IsPinned: true,
            Classification: 2,
            AppointmentTypeId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            AppointmentType: null,
            Patient: {
                PatientCode: 'ABCDEF'
            }
        };

        let result = service.transformSingleAppointmentForSchedule(localMockPinnedAppointments, [], '', true);

        expect(result.patientCode).toEqual('ABCDEF');
    });

    it('removePinnedAppointmentIfItExists should not remove items from the list when the parameter is null', () => {
        service.allPinnedAppointments = mockPinnedAppointments;
        service.removePinnedAppointmentIfItExists(null);
        let result = service.allPinnedAppointments
        expect(result.length).toEqual(3);
    });

    it('removePinnedAppointmentIfItExists should not remove items from the list when the items cannot be found', () => {
        service.allPinnedAppointments = mockPinnedAppointments;
        service.removePinnedAppointmentIfItExists('');
        let result = service.allPinnedAppointments
        expect(result.length).toEqual(3);
    });

    it('removePinnedAppointmentIfItExists should remove item from the list when the item can be found', () => {
        service.allPinnedAppointments = mockPinnedAppointments;
        service.removePinnedAppointmentIfItExists('33809683-e1b2-416a-a612-ef385d796f30');
        let result = service.allPinnedAppointments
        expect(result.length).toEqual(2);
    });
});
