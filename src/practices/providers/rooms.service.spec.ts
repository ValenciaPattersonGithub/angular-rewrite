import { TestBed } from '@angular/core/testing';

import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
    let service: RoomsService;

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

    const mockRoomsService: RoomsService = new RoomsService();
    mockRoomsService.rooms = mockRooms;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: RoomsService, useValue: mockRoomsService }
            ]
        });
        service = TestBed.get(RoomsService);
    }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('findByRoomId should return null when rooms list is null or undefined', () => {
        let localService = new RoomsService();
        localService.rooms = null;

        const result = localService.findByRoomId('ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25');
        expect(result).toEqual(null);
    });

    it('findByRoomId should return Room when one is found', () => {
        const result = service.findByRoomId('ef6b258f-5a64-4ed9-ac5e-e0e5abe5bd25');
        expect(result).toEqual(mockRooms[1]);
    });

    it('findByRoomId should return null when Room is not found', () => {
        const result = service.findByRoomId('stuff');
        expect(result).toEqual(null);
    });

    it('findAllByLocationId should return empty array when rooms list is null or undefined', () => {
        let localService = new RoomsService();
        localService.rooms = null;

        const result = localService.findAllByLocationId(0);
        expect(result).toEqual([]);
    });

    it('findAllByLocationId should return empty array when no room is in the location', () => {
        const result = service.findAllByLocationId(0);
        expect(result).toEqual([]);
    });

    it('findAllByLocationId should return array when room for location found', () => {
        const result = service.findAllByLocationId(10);
        expect(result.length).toEqual(1);
    });
    //$scope.allTreatmentRooms
});

