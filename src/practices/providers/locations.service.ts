import { Injectable } from '@angular/core';

@Injectable()
export class LocationsService {

    locations: any[];

    constructor() { }

    findByLocationId(id: number) {
        if (this.locations) {
            for (let i = 0; i < this.locations.length; i++) {
                if (this.locations[i]['LocationId'] === id) {
                    return this.locations[i];
                }
            }
        }
        return null;
    }

    findByNameAbbreviation(abbr: string) {
        if (this.locations) {
            for (let i = 0; i < this.locations.length; i++) {
                if (this.locations[i]['NameAbbreviation'] === abbr) {
                    return this.locations[i];
                }
            }
        }
        return null;
    }

    getRoomsFromLocations() {
        let rooms = []
        if (this.locations) {
            for (let i = 0; i < this.locations.length; i++) {
                let ofcLocation = this.locations[i];
                if (ofcLocation.Rooms !== null && ofcLocation.Rooms !== undefined) {
                    for (let r = 0; r < ofcLocation.Rooms.length; r++) {
                        let room = ofcLocation.Rooms[r];
                        room.timezone = ofcLocation.Timezone ? ofcLocation.Timezone : '';
                        room.tz = ofcLocation.timezoneInfo
                            ? ofcLocation.timezoneInfo.displayAbbr ? ofcLocation.timezoneInfo.abbr : ''
                            : '';
                        // determine locationAbbr 
                        // this code assumes empty string is appropriate if parts of this value are not present
                        let abbr = ofcLocation.NameAbbreviation ? ofcLocation.NameAbbreviation : '';
                        if (abbr !== '' && room.tz !== '') {
                            room.locationAbbr = abbr + ' (' + room.tz + ')';
                        } else {
                            room.locationAbbr = '';
                        }
                        rooms.push(room);
                    }
                }
            }
        }
        return rooms;
    }

    doesRoomExistInLocation(roomId, locationId) {
        let doesRoomExistInLocation = false;
        if (this.locations) {
            for (let i = 0; i < this.locations.length; i++) {
                let ofcLocation = this.locations[i];
                if (ofcLocation.LocationId === locationId && ofcLocation.Rooms !== null && ofcLocation.Rooms !== undefined && roomId) {
                    for (let r = 0; r < ofcLocation.Rooms.length; r++) {
                        if (ofcLocation.Rooms[r].RoomId === roomId ) {
                           doesRoomExistInLocation = true;
                           return doesRoomExistInLocation;
                       }
                    }
                }
            }
        }
        return doesRoomExistInLocation;
    }

    findLocationsByLocationList(list) {
        let tempLocations = [];
        if (list) {
            for (let i = 0; i < list.length; i++) {
                let ofcLocation = this.findByLocationId(list[i].LocationId);
                if (ofcLocation !== null) {
                    tempLocations.push(ofcLocation);
                }
            }
        }
        return tempLocations;
    }

    getLocationIdsFromList(list) {
        let tempList: number[] = [];
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].LocationId !== null && list[i].LocationId !== undefined) {
                    tempList.push(list[i].LocationId);
                }
            }
        }
        return tempList;
    }

    findLocationsInBothPatientLocationsAndUsersLocations(patientLocations, userLocations) {
        let tempList = [];
        if (patientLocations && userLocations) {
            for (let i = 0; i < patientLocations.length; i++) {
                for (let x = 0; x < userLocations.length; x++) {
                    if (patientLocations[i].LocationId === userLocations[x].LocationId) {
                        tempList.push(userLocations[x]);
                    }
                }
            }
        }
        return tempList;
    }

    addInactiveFlagtoLocations(patientLocations, allLocations) {
        let tempList = [];
        if (patientLocations && allLocations) {
            for (let i = 0; i < patientLocations.length; i++) {
                for (let x = 0; x < allLocations.length; x++) {
                    if (patientLocations[i].LocationId === allLocations[x].id) {
                        patientLocations[i].DeactivationTimeUtc = allLocations[x].deactivationTimeUtc;
                        break;
                    }
                }
                tempList.push(patientLocations[i]);
            }
        }
        return tempList;
    }

};
