import { TestBed } from '@angular/core/testing';

import { ScheduleAppointmentUtilitiesService } from './schedule-appointment-utilities.service';
import { RoomsService } from '../../../practices/providers/rooms.service';

describe('ScheduleAppointmentUtilitiesService', () => {
    let service: ScheduleAppointmentUtilitiesService;

    const mockRooms: any[] = [
        {
            RoomId: 'someText',
            LocationId: 10
        },
        {
            RoomId: 'ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25',
            LocationId: 20

        }
    ];

    const mockLocations: any[] = [
        {
            LocationId: 1,
            Rooms: [
                {
                    RoomId: 'one'
                },
                {
                    RoomId: 'two'
                }
            ]
        },
        {
            LocationId: 2,
            Rooms: [
                {
                    RoomId: 'three'
                },
                {
                    RoomId: 'four'
                }
            ]
        },
        {
            LocationId: 3,
            Rooms: [
                {
                    RoomId: 'five'
                },
                {
                    RoomId: 'six'
                }
            ]
        },
        {
            LocationId: 4,
            Rooms: [
                {
                    RoomId: 'seven'
                },
                {
                    RoomId: 'eight'
                }
            ]
        }
    ];

    const mockRoomsService: RoomsService = new RoomsService();
    mockRoomsService.rooms = mockRooms;

    const mockScheduleAppointmentUtilitiesService = new ScheduleAppointmentUtilitiesService(mockRoomsService);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ScheduleAppointmentUtilitiesService, useValue: mockScheduleAppointmentUtilitiesService },
                { provide: RoomsService, useValue: mockRoomsService }
            ]
        });
        service = TestBed.get(ScheduleAppointmentUtilitiesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getLocationIdForAppointment should return selectedLocationId when roomId is null', () => {
        const result = service.getLocationIdForAppointment(null, { LocationId: 1 });
        expect(result).toEqual(1);
    });

    it('getLocationIdForAppointment should return selectedLocationId when roomId is not found', () => {
        const result = service.getLocationIdForAppointment('test', { LocationId: 1 });
        expect(result).toEqual(1);
    });

    it('getLocationIdForAppointment should return roomService locationId when roomId is found', () => {
        const result = service.getLocationIdForAppointment('someText', { LocationId: 1 });
        expect(result).toEqual(10);
    });

    it('filterLocationsForAppointmentModal should return empty list if userLocations is null', () => {
        const result = service.filterLocationsForAppointmentModal(null, null);
        expect(result.length).toEqual(0);
    });

    it('filterLocationsForAppointmentModal should return empty list if userLocations is empty', () => {
        const result = service.filterLocationsForAppointmentModal(null, []);
        expect(result.length).toEqual(0);
    });

    it('filterLocationsForAppointmentModal should return empty list if userLocations values have no rooms', () => {
        const tempList: any[] = [
            { LocationId: 34 },
            { LocationId: 350 },
            { LocationId: 380 },
            { LocationId: 450 }
        ];

        const result = service.filterLocationsForAppointmentModal(null, tempList);
        expect(result.length).toEqual(0);
    });

    it('filterLocationsForAppointmentModal should return list with all userLocations values when patient is null', () => {
        const result = service.filterLocationsForAppointmentModal(null, mockLocations);
        expect(result.length).toEqual(mockLocations.length);
    });

    it('filterLocationsForAppointmentModal should return list with all userLocations values when patient PatientLocations is null', () => {
        const localPatient = {};

        const result = service.filterLocationsForAppointmentModal(localPatient, mockLocations);
        expect(result.length).toEqual(mockLocations.length);
    });

    it('filterLocationsForAppointmentModal should return empty list when patient PatientLocations is empty', () => {
        const localPatient = {
            PatientLocations: []
        };

        const result = service.filterLocationsForAppointmentModal(localPatient, mockLocations);
        expect(result.length).toEqual(0);
    });

    it('filterLocationsForAppointmentModal should return empty list when patient PatientLocations do not match any userLocations', () => {
        const localPatient = {
            PatientLocations: [
                {
                    LocationId: 7
                },
                {
                    LocationId: 8
                },
            ]
        };

        const result = service.filterLocationsForAppointmentModal(localPatient, mockLocations);
        expect(result.length).toEqual(0);
    });

    it('filterLocationsForAppointmentModal should return list with all locations in both PatientLocations and userLocations', () => {
        const localPatient = {
            PatientLocations: [
                {
                    LocationId: 1
                },
                {
                    LocationId: 4
                },

            ]
        };

        const result = service.filterLocationsForAppointmentModal(localPatient, mockLocations);
        expect(result.length).toEqual(2);
        expect(service.defaultLocationSelection).toEqual(null);
    });

    it('filterLocationsForAppointmentModal should return list with locations and defaultLocationSelection should be set to the primaryLocation and when IsPrimary is specified on one of the patientLocations', () => {
        const localPatient = {
            PatientLocations: [
                {
                    LocationId: 1
                },
                {
                    LocationId: 4,
                    IsPrimary: true
                },

            ]
        };

        const result = service.filterLocationsForAppointmentModal(localPatient, mockLocations);
        expect(result.length).toEqual(2);
        expect(service.defaultLocationSelection.LocationId).toEqual(4)
    });

    it('processFilterSettingsAfterOrdering should return null when locationList is empty', () => {

        const result = service.processFilterSettingsAfterOrdering(null, null, []);
        expect(result).toEqual(null);
    });

    it('processFilterSettingsAfterOrdering should return LocationId currently selected when patient and locationId specified', () => {
        const localPatient = {
            PatientLocations: [
                {
                    LocationId: 1,
                    currentLocation: 1
                },
                {
                    LocationId: 4,
                    IsPrimary: true,
                    currentLocation: 1
                },

            ]
        };

        const result = service.processFilterSettingsAfterOrdering(localPatient, 1, localPatient.PatientLocations);
        expect(result).toEqual(localPatient.PatientLocations[0]);
    });


    it('processFilterSettingsAfterOrdering should return currentLocation where defaultLocationSelection is null and patient is null', () => {
        service.defaultLocationSelection = null;
        const localPatient = {
            PatientLocations: [
                {
                    LocationId: 1,
                    currentLocation: 1
                },
                {
                    LocationId: 4,
                    IsPrimary: true,
                    currentLocation: 1
                },

            ]
        };
        const result = service.processFilterSettingsAfterOrdering(null, null, localPatient.PatientLocations);
        expect(result).toEqual({
            LocationId: 1,
            currentLocation: 1
        });
    });

    it('processFilterSettingsAfterOrdering should return defaultLocationSelection when defaultLocationSelection is not null and LocationId is null', () => {
        service.defaultLocationSelection = {
            LocationId: 4
        };
        const localPatient = {
            PatientLocations: [
                {
                    LocationId: 1
                },
                {
                    LocationId: 4,
                    IsPrimary: true
                },

            ]
        };
        const result = service.processFilterSettingsAfterOrdering(localPatient, null, localPatient.PatientLocations);
        expect(result).toEqual({
            LocationId: 4
        });
    });

    it('processFilterSettingsAfterOrdering should return currentLocation when patient and defaultLocationSelection are null', () => {
        service.defaultLocationSelection = null;
        const localPatient = {
            PatientLocations: [
                {
                    LocationId: 1,
                    currentLocation: 4
                },
                {
                    LocationId: 4,
                    IsPrimary: true,
                    currentLocation: 4
                },

            ]
        };
        const result = service.processFilterSettingsAfterOrdering(localPatient, null, localPatient.PatientLocations);
        expect(result).toEqual({
            LocationId: 4,
            IsPrimary: true,
            currentLocation: 4
        });
    });

    it('processFilterSettingsAfterOrdering should return first location when locationId is not in the locationList', () => {
        service.defaultLocationSelection = null;

        let locationId = 2;

        const localPatient = {
            PatientLocations: [
                {
                    LocationId: 1,
                    currentLocation: 4
                },
                {
                    LocationId: 4,
                    IsPrimary: true,
                    currentLocation: 4
                },

            ]
        };
        const result = service.processFilterSettingsAfterOrdering(localPatient, locationId, localPatient.PatientLocations);
        expect(result).toEqual({
            LocationId: 1,
            currentLocation: 4
        });
    });

});