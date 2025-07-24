import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare var angular: angular.IAngularStatic;

@Injectable()
export class RoomDropdownService {
  private displayRoomListSubject = new BehaviorSubject(null);
  private selectedRoomListSubject = new BehaviorSubject(null);
  private displayRoomList: any = [];
  private selectedRoomList: any = [];

  constructor() {}

  //This is called from room-dropdown.component to set the rooms on initialization or when the list changes
  setDisplayRoomList(roomList) {
    this.displayRoomList = angular.copy(roomList);
  }

  //This is called from room-dropdown.component to set the rooms on initialization or when the list changes
  setSelectedRoomList(checkedList) {
    this.selectedRoomList = angular.copy(checkedList);
  }

  //This is called from room-dropdown.component to set the rooms on initialization or when the list changes
  getDisplayRoomList() {
    return this.displayRoomList;
  }

  //This is called from room-dropdown.component to get the selected Rooms
  getSelectedRoomList() {
    return this.selectedRoomList;
  }

  //This is called when the location dropdown is clicked to show/open
  getDisplayRoomListAsObservable() {
    this.displayRoomListSubject.next(this.displayRoomList);
  }

  //This is called when the location dropdown is clicked to show/open
  getSelectedRoomListAsObservable() {
    this.selectedRoomListSubject.next(this.selectedRoomList);
  }

  //This is called when Select All for Locations is selected
  addAllRoomsForAllLocations(selectedLocationList) {
    this.selectedRoomList = [];
    this.displayRoomList = [];
    for (var i = 0; i < selectedLocationList.length; i++) {
      for (var j = 0; j < selectedLocationList[i].Rooms.length; j++) {
        this.selectedRoomList.push({
          Name: selectedLocationList[i].Rooms[j].Name,
          RoomId: selectedLocationList[i].Rooms[j].RoomId,
          LocationId: selectedLocationList[i].Rooms[j].LocationId,
          locationAbbr: selectedLocationList[i].displayText,
          locationAbbrLocations: [selectedLocationList[i].Rooms[j].LocationId],
          checked: true,
        });

        this.displayRoomList.push({
          Name: selectedLocationList[i].Rooms[j].Name,
          RoomId: selectedLocationList[i].Rooms[j].RoomId,
          LocationId: selectedLocationList[i].Rooms[j].LocationId,
          locationAbbr: selectedLocationList[i].displayText,
          locationAbbrLocations: [selectedLocationList[i].Rooms[j].LocationId],
          checked: true,
        });
      }
    }
    this.selectedRoomListSubject.next(this.selectedRoomList);
    this.displayRoomListSubject.next(this.displayRoomList);
  }

  //This is called when Select All for Locations is deselected
  removeAllRoomsForAllLocations() {
    this.selectedRoomList = [];
    this.displayRoomList = [];
    this.selectedRoomListSubject.next(this.selectedRoomList);
    this.displayRoomListSubject.next(this.displayRoomList);
  }

  //This is called when a location is selected in location dropdown
  //http://www.mukeshkumar.net/articles/angular5/share-data-between-sibling-components-in-angular-5-using-rxjs-behaviorsubject
  addRoomsForNewlySelectedLocation(selectedLocationList, locationId) {
    for (var i = 0; i < selectedLocationList.length; i++) {
      for (var j = 0; j < selectedLocationList[i].Rooms.length; j++) {
        if (selectedLocationList[i].Rooms[j].LocationId === locationId) {
          this.selectedRoomList.push({
            Name: selectedLocationList[i].Rooms[j].Name,
            RoomId: selectedLocationList[i].Rooms[j].RoomId,
            LocationId: selectedLocationList[i].Rooms[j].LocationId,
            locationAbbr: selectedLocationList[i].displayText,
            locationAbbrLocations: [
              selectedLocationList[i].Rooms[j].LocationId,
            ],
            checked: true,
          });

          this.displayRoomList.push({
            Name: selectedLocationList[i].Rooms[j].Name,
            RoomId: selectedLocationList[i].Rooms[j].RoomId,
            LocationId: selectedLocationList[i].Rooms[j].LocationId,
            locationAbbr: selectedLocationList[i].displayText,
            locationAbbrLocations: [
              selectedLocationList[i].Rooms[j].LocationId,
            ],
            checked: true,
          });
        }
      }
    }
    this.selectedRoomListSubject.next(this.selectedRoomList);
    this.displayRoomListSubject.next(this.displayRoomList);
  }

  //http://www.mukeshkumar.net/articles/angular5/share-data-between-sibling-components-in-angular-5-using-rxjs-behaviorsubject
  addRoomsForInitializingLocation(selectedLocationList, displayRoomList) {
    this.selectedRoomListSubject.next(selectedLocationList);
    this.displayRoomListSubject.next(displayRoomList);
  }

  //This is called when a location is deselected in location dropdown
  removeRoomsForDeselectedLocation(locationId) {
    this.selectedRoomList = this.selectedRoomList.filter(
      itemInArray => itemInArray.LocationId !== locationId
    );
    this.displayRoomList = this.displayRoomList.filter(
      itemInArray => itemInArray.LocationId !== locationId
    );

    this.selectedRoomListSubject.next(this.selectedRoomList);
    this.displayRoomListSubject.next(this.displayRoomList);
  }

  //We subscribe to this method
  getRoomsForSelectedLocations() {
    return this.selectedRoomListSubject.asObservable();
  }
  //We subscribe to this method
  getRoomsForDisplayedLocations() {
    return this.displayRoomListSubject.asObservable();
  }
}
