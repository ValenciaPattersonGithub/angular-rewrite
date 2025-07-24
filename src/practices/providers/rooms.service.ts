import { Injectable } from '@angular/core';

@Injectable()
export class RoomsService {
    rooms: any[];

    constructor() { }

    findByRoomId(id: string) {
        if (this.rooms) {
            // look at foreach typescript and check performance between them ... 
            for (let i = 0; i < this.rooms.length; i++) {
                if (this.rooms[i]['RoomId'] === id) {
                    return this.rooms[i];
                }
            }
        }
        return null;
    }

    findAllByLocationId(locationId: number) {
        let localRooms = [];
        if (this.rooms) {
            for (let i = 0; i < this.rooms.length; i++) {
                if (this.rooms[i]['LocationId'] === locationId) {
                    localRooms.push(this.rooms[i]);
                }
            }
        }
        return localRooms;
    }
};
