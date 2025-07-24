// service for replacing the existing schedule appointment utilities service
import { Injectable, Inject } from '@angular/core';
import * as moment from 'moment';

// angular barrel (using index.ts files export which allows us to have truncated path)
import { RoomsService } from '../../../practices/providers';

@Injectable()
export class ScheduleAppointmentUtilitiesService {
    defaultLocationSelection: any;

    constructor(private roomsService: RoomsService) { }

    // appointment locationId should match treatmentRoom.LocationId if we have a treatment room id
    // appointment locationId should match $scope.selectedLocationLocationId if no treatment room id
    getLocationIdForAppointment(roomId: string, selectedLocation) {
        let selectedLocationId = 0;

        // select the correct location based on room view if roomId is not null
        if (roomId !== null && roomId !== undefined) {
            var room = this.roomsService.findByRoomId(roomId);
            if (room !== null) {
                selectedLocationId = room.LocationId;
            }
        }

        if (selectedLocation !== null && selectedLocation !== undefined && selectedLocationId === 0) {
            // after we get location type defined change this method to include that type check in the top
            // then we can be assured the locationId is set with a number
            selectedLocationId = selectedLocation.LocationId;
        }

        return selectedLocationId;
    }

    filterLocationsForAppointmentModal(patient, userLocations) {
        let filteredLocations = [];
        this.defaultLocationSelection = null;

        if (userLocations) {
            for (let i = 0; i < userLocations.length; i++) {
                if (userLocations[i].Rooms !== null && userLocations[i].Rooms !== undefined && userLocations[i].Rooms.length > 0) {
                    if (patient && patient.PatientLocations) {
                        for (let x = 0; x < patient.PatientLocations.length; x++) {
                            if (userLocations[i].LocationId === patient.PatientLocations[x].LocationId) {
                                filteredLocations.push(userLocations[i]);

                                if (patient.PatientLocations[x].IsPrimary && patient.PatientLocations[x].IsPrimary === true) {
                                    this.defaultLocationSelection = userLocations[i];
                                }
                            }
                        }
                    } else {
                        filteredLocations.push(userLocations[i]);
                    }
                }

            }
        }

        return filteredLocations;
    }

    // ideally we would convert the grouping logic to TypeScript however that would take a while so I am holding off but still converting this bit of logic to help with testing.
    processFilterSettingsAfterOrdering(patient, locationId, locationList) {
        let newSelection = null;

        if (locationList !== null &&
            locationList !== undefined &&
            locationList.length > 0) {

            if (locationId !== null && locationId !== undefined && patient !== null) {
                newSelection = locationList.find(location => location.LocationId === locationId);

                if (newSelection === null || newSelection === undefined) {
                    newSelection = locationList[0];
                }
            } else if (locationId === null && locationId === undefined && patient !== null) {
                if (this.defaultLocationSelection === null) {
                    newSelection = locationList.find(location => location.LocationId === location.currentLocation);
                } else {
                    newSelection = this.defaultLocationSelection;
                }
            } else if (this.defaultLocationSelection === null) {
                newSelection = locationList.find(location => location.LocationId === location.currentLocation);
            } else {
                newSelection = this.defaultLocationSelection;
            }
        }

        return newSelection;
    }
}
