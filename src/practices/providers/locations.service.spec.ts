import { TestBed } from '@angular/core/testing';

import { LocationsService } from './locations.service';

describe('LocationsService', () => {
    let service: LocationsService;

    const mockLocations: any[] = [
        {
            LocationId: 1,
            Timezone: 'zone',
            NameAbbreviation: 'nameAbbr',
            timezoneInfo: {
                abbr: 'abbr',
                displayAbbr: 'abbr'
            },
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
        }
    ];

    const mockLocationsService = new LocationsService();

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: LocationsService, useValue: mockLocationsService }
            ]
        });
        service = TestBed.get(LocationsService);
    }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('findByLocationId should return null when locations list is null or undefined', () => {
        let localService = new LocationsService();
        localService.locations = null;

        const result = localService.findByLocationId(10);
        expect(result).toEqual(null);
    });

    it('findByLocationId should return Location when one is found', () => {
        service.locations = mockLocations;
        const result = service.findByLocationId(2);
        expect(result).toEqual(mockLocations[1]);
    });

    it('findByLocationId should return null when Location is not found', () => {
        service.locations = mockLocations;
        const result = service.findByLocationId(10);
        expect(result).toEqual(null);
    });

    it('findByNameAbbreviation should return null when locations list is null or undefined', () => {
        let localService = new LocationsService();
        localService.locations = null;

        const result = localService.findByNameAbbreviation('stuff');
        expect(result).toEqual(null);
    });

    it('findByNameAbbreviation should return Location when one is found', () => {
        service.locations = mockLocations;
        const result = service.findByNameAbbreviation(mockLocations[1].NameAbbreviation);
        expect(result).toEqual(mockLocations[1]);
    });

    it('findByNameAbbreviation should return null when Location is not found', () => {
        service.locations = mockLocations;
        const result = service.findByNameAbbreviation('stuff');
        expect(result).toEqual(null);
    });

    it('getRoomsFromLocations should return empty array when locations list is null or undefined', () => {
        let localService = new LocationsService();
        localService.locations = null;

        const result = localService.getRoomsFromLocations();
        expect(result).toEqual([]);
    });

    it('getRoomsFromLocations should return empty array when locations do not have rooms', () => {
        let localService = new LocationsService();
        localService.locations = [
            {
                LocationId: 1
            },
            {
                LocationId: 2
            }
        ];

        const result = localService.getRoomsFromLocations();
        expect(result).toEqual([]);
    });

    it('getRoomsFromLocations should return array of rooms when locations have rooms', () => {
        service.locations = mockLocations;

        const result = service.getRoomsFromLocations();
        expect(result.length).toEqual(4);
    });

    it('getRoomsFromLocations should return array of rooms and populate room the values correctly', () => {
        service.locations = mockLocations;

        const result = service.getRoomsFromLocations();
        expect(result[0].timezone).toEqual('zone');
        expect(result[3].timezone).toEqual('');
        expect(result[0].tz).toEqual('abbr');
        expect(result[3].tz).toEqual('');
        expect(result[0].locationAbbr).toEqual('nameAbbr (abbr)');
        expect(result[3].locationAbbr).toEqual('');
    });

    it('findLocationsByLocationList should return empty list if you provide it with a null value', () => {
        service.locations = mockLocations;
        const result = service.findLocationsByLocationList(null);
        expect(result).toEqual([]);
    });

    it('findLocationsByLocationList should return single location when one location is found', () => {
        service.locations = mockLocations;

        const tempLocations: any[] = [
            {
                LocationId: 2
            },
            {
                LocationId: 1400
            }
        ];
        const result = service.findLocationsByLocationList(tempLocations);
        expect(result.length).toEqual(1);
        expect(result[0].LocationId).toEqual(2);
    });

    it('getLocationIdsFromList should return empty list if you provide it with a null value', () => {
        const result = service.getLocationIdsFromList(null);
        expect(result).toEqual([]);
    });

    it('getLocationIdsFromList should return id list if provided with locations', () => {
        const tempList: any[] = [
            { LocationId: 34 },
            { LocationId: 350 },
            { LocationId: 380 },
            { LocationId: 450 }
        ];
        const result = service.getLocationIdsFromList(tempList);
        expect(result.length).toEqual(4);
    });

    it('findLocationsInBothPatientLocationsAndUsersLocations should return empty list if you provide it with a null value for patientLocations', () => {
        const tempList: any[] = [
            { LocationId: 34 },
            { LocationId: 350 },
            { LocationId: 380 },
            { LocationId: 450 }
        ];
        const result = service.findLocationsInBothPatientLocationsAndUsersLocations(null, tempList);
        expect(result).toEqual([]);
    });

    it('findLocationsInBothPatientLocationsAndUsersLocations should return empty list if you provide it with a null value for userLocations', () => {
        const tempList: any[] = [
            { LocationId: 34 },
            { LocationId: 350 },
            { LocationId: 380 },
            { LocationId: 450 }
        ];
        const result = service.findLocationsInBothPatientLocationsAndUsersLocations(tempList, null);
        expect(result).toEqual([]);
    });

    it('findLocationsInBothPatientLocationsAndUsersLocations should return locations that are in both lists', () => {
        const tempPatientLocations: any[] = [
            {
                LocationId: 2
            },
            {
                LocationId: 1400
            },
            {
                LocationId: 3
            }
        ];

        const tempUserLocations: any[] = [
            {
                LocationId: 2
            },
            {
                LocationId: 1423
            },
            {
                LocationId: 4
            }
        ];
        const result = service.findLocationsInBothPatientLocationsAndUsersLocations(tempPatientLocations, tempUserLocations);
        expect(result.length).toEqual(1);
        expect(result[0].LocationId).toEqual(2);
    });
});

