import {EventEmitter, Inject, Injectable, Output} from '@angular/core';
declare var angular: angular.IAngularStatic;


@Injectable()
export class LocationDropdownService {
    private selectedLocationList = [];
    private selectedLocationListOnInit = [];
    private displayLocationListOnInit = [];
    private selectedRoomListOnInit = [];
    private displayRoomListOnInit = [];
    private selectedProviderListOnInit = [];
    private displayProviderListOnInit = [];
    private currentScheduleView: string;
    @Output() lostFocusEvent = new EventEmitter<string>();
    public retrievingDefaultSettings: boolean = false;
       
   constructor(@Inject('userSettingsDataService') private userSettingsDataService) {
        
   }

   //This sorts the list by Last Name and then by First Name
    sortOnFirstAndLast(a, b) {
        
        const result = a.LastName.localeCompare(b.LastName);

        return result !== 0 ? result : a.FirstName.localeCompare(b.FirstName);
    }

    //We subscribe to this event from the Provider and Room Components
    //This fires after location loses focus
    lostFocus(msg: string) {
        this.lostFocusEvent.emit(msg);
    }
    
    //This sets the this.currentScheduleView to room or provider. Whatever view user is in at the moment
    setCurrentScheduleView(currentScheduleView) {
        this.currentScheduleView = currentScheduleView;
    }

    //This gets the this.currentScheduleView to room or provider. Whatever view user is in at the moment
    getCurrentScheduleView() {
        return this.currentScheduleView;
    }

    //This is the location list that holds the display locations on init
    private setDisplayLocationListOnInit(locationList) {
        this.displayLocationListOnInit = angular.copy(locationList);
    }

    //This is the list that holds the selected locations on init
    private setSelectedLocationListOnInit(selectedLocationList) {
        this.selectedLocationListOnInit = angular.copy(selectedLocationList);
    }

    //This will return the location list to display on init
    getDisplayLocationListOnInit() {
        return this.displayLocationListOnInit;
    }
    //This will return the selected locations on init
    getSelectedLocationListOnInit() {
        return this.selectedLocationListOnInit;
    }

    //This will return the selected locations
    getSelectedLocationList() {
        return this.selectedLocationList = this.selectedLocationListOnInit;
    }

    //This is the room list that holds the display rooms on init
    private setDisplayRoomListOnInit(roomList) {
        this.displayRoomListOnInit = angular.copy(roomList);
    }
    //This is the list that holds the selected rooms on init
    private setSelectedRoomListOnInit(selectedRoomList) {
        this.selectedRoomListOnInit = angular.copy(selectedRoomList);
    }
    //This will return the room list to display on init
    getDisplayRoomListOnInit() {
        return this.displayRoomListOnInit;
    }
     //This will return the selected rooms on init
    getSelectedRoomListOnInit() {
        return this.selectedRoomListOnInit;
    }

    //This is the provider list that holds the display providers on init
    private setDisplayProviderListOnInit(providerList) {
        this.displayProviderListOnInit = angular.copy(providerList);
    }
    //This is the list that holds the selected providers on init
    private setSelectedProviderListOnInit(selectedProviderList) {
        this.selectedProviderListOnInit = angular.copy(selectedProviderList);
    }
    //This will return the provider list to display on init
    getDisplayProviderListOnInit() {
        return this.displayProviderListOnInit;
    }
    //This will return the selected providers on init
    getSelectedProviderListOnInit() {
        return this.selectedProviderListOnInit;
    }

   

    //This is our global default location used when no location is selected and no user settings saved
    getInitLocation() {
        return JSON.parse(sessionStorage.getItem('userLocation'));
    }

    //On init of location, display user settings and if there are none, then getInitLocation to select default location
     getUserSettings(){
        let userSettings = this.userSettingsDataService.getUserSettings();
        return userSettings;
    }

    //If in Room View and On Init of location, display user settings for the global location selected and if there are no rooms for the location, then getInitLocation to select default/global location
    initializeUserSettingsForRooms(locationList) {
        let defaultLocation = this.getInitLocation();
        let userSettings = this.getUserSettings();
        let userSettingsString;
        let userSettingsObject;
        let scheduleColumnOrder;
        let doesUserSettingsExistForRoomsForGlobalLocation = false;
               
        //if the user has user settings saved             
        if (userSettings) {
            userSettingsString = JSON.stringify(userSettings);
            userSettingsObject = JSON.parse(userSettingsString);
           
            if (userSettingsObject.values.ScheduleColumnOrder) {

                scheduleColumnOrder = JSON.parse(userSettingsObject.values.ScheduleColumnOrder);
                doesUserSettingsExistForRoomsForGlobalLocation = this.doesUserSettingsExistForRoomsForGlobalLocation(scheduleColumnOrder, defaultLocation.id)

                if (doesUserSettingsExistForRoomsForGlobalLocation) {

                    this.getGlobalLocationRoomsForUserSettings(locationList, scheduleColumnOrder, defaultLocation.id);
                    this.retrievingDefaultSettings = true;

                }
                //This will load the global location and its rooms if the user does not have user settings saved
                else {
                    this.getDefaultGlobalLocationRooms(locationList, defaultLocation.id);
                    this.retrievingDefaultSettings = true;
                }
            }

        }
               
    }

    //If in Provider View and On Init of location, display user settings for the global location selected and if there are no providers for the location, then getInitLocation to select default/global location
    initializeUserSettingsForProviders(locationList) {
        let defaultLocation = this.getInitLocation();
        let userSettings = this.getUserSettings();
        let userSettingsString;
        let userSettingsObject;
        let scheduleColumnOrder;
        let doesUserSettingsExistForProvidersForGlobalLocation = false;

        //if the user has user settings saved
        if (userSettings) {
            userSettingsString = JSON.stringify(userSettings);
            userSettingsObject = JSON.parse(userSettingsString);

            if (userSettingsObject.values.ScheduleColumnOrder) {

                scheduleColumnOrder = JSON.parse(userSettingsObject.values.ScheduleColumnOrder);
                doesUserSettingsExistForProvidersForGlobalLocation = this.doesUserSettingsExistForProvidersForGlobalLocation(scheduleColumnOrder, defaultLocation.id)

                if (doesUserSettingsExistForProvidersForGlobalLocation) {

                    this.getGlobalLocationProvidersForUserSettings(locationList, scheduleColumnOrder, defaultLocation.id);
                    this.retrievingDefaultSettings = true;

                }
                //This will load the global location and its providers if the user does not have user settings saved
                else {
                    this.getDefaultGlobalLocationProviders(locationList, defaultLocation.id);
                    this.retrievingDefaultSettings = true;
                }
            }

        }
                
    }

    //This checks to see if the global location that is selected has rooms saved in user settings for that location.
    doesUserSettingsExistForRoomsForGlobalLocation(scheduleColumnOrder, defaultLocationId) {
        let doesUserSettingsExistForRoomsForGlobalLocation = false;
        if (scheduleColumnOrder.length > 0) {
            for (var i = 0; i < scheduleColumnOrder.length; i++) {

                if (scheduleColumnOrder[i].location === defaultLocationId && scheduleColumnOrder[i].room.length > 0) {
                    doesUserSettingsExistForRoomsForGlobalLocation = true;
                }
                
            }
        }
        
        return doesUserSettingsExistForRoomsForGlobalLocation;
    }

    //This checks to see if the global location that is selected has providers saved in user settings for that location.
    doesUserSettingsExistForProvidersForGlobalLocation(scheduleColumnOrder, defaultLocationId) {
        let doesUserSettingsExistForProvidersForGlobalLocation = false;
        if (scheduleColumnOrder.length > 0) {
            for (var i = 0; i < scheduleColumnOrder.length; i++) {

                if (scheduleColumnOrder[i].location === defaultLocationId && scheduleColumnOrder[i].provider.length > 0) {
                    doesUserSettingsExistForProvidersForGlobalLocation = true;
                }

            }
        }

        return doesUserSettingsExistForProvidersForGlobalLocation;
    }

     //This performs the logic to set the rooms and select the locations for the rooms that are stored in user settings for the selected global location
    getGlobalLocationRoomsForUserSettings(locationList, scheduleColumnOrder, defaultLocationId) {
        let checkedList = [];
        this.selectedRoomListOnInit = [];
        this.displayRoomListOnInit = [];
        this.selectedLocationListOnInit = [];
        this.displayLocationListOnInit = [];

        let scheduleColumnOrderResult = scheduleColumnOrder.filter(function (scheduleColumnOrder) { return scheduleColumnOrder.location === defaultLocationId});
        if (scheduleColumnOrderResult.length > 0) {
            for (var i = 0; i < scheduleColumnOrderResult[0].room.length; i++) {
              for (var j = 0; j < locationList.length; j++) {
                  for (var k = 0; k < locationList[j].Rooms.length; k++) {
                      //This adds a checked property to the location for the room added in the ScheduleColumnOrder list from user settings ScheduleColumnOrder column
                      if (scheduleColumnOrderResult[0].room[i] === locationList[j].Rooms[k].RoomId){
                          locationList[j].checked = true;
                          checkedList.push(locationList[j]);

                           this.selectedRoomListOnInit.push({
                            Name: locationList[j].Rooms[k].Name,
                            RoomId: locationList[j].Rooms[k].RoomId,
                            LocationId: locationList[j].Rooms[k].LocationId,
                            locationAbbr: locationList[j].displayText,
                            locationAbbrLocations: [locationList[j].Rooms[k].LocationId],
                            checked: true
                           });
                
                      }
                      else {
                          //If the locationList[j].checked property did not get set to true in the if condition, then we add the checked property and set to false here
                          if (!locationList[j].checked) {
                              locationList[j].checked = false;
                          }
                      }
                  

                  }
                  //This selects the location in the checkedList if no rooms for the default location are saved in the user settings
                    if (locationList[j].LocationId === defaultLocationId) {
                        let doesDefaultLocationExistInCheckedList = false;
                        doesDefaultLocationExistInCheckedList = this.doesDefaultLocationExistInCheckedList(checkedList, defaultLocationId);
                        if (!doesDefaultLocationExistInCheckedList) {
                            locationList[j].checked = true;
                            checkedList.push(locationList[j]);
                        }
                    }
              }
            }
            //We need to copy the selectedRoomListOnInit to the displayRoomListOnInit
            this.displayRoomListOnInit = angular.copy(this.selectedRoomListOnInit);
        }
       

        //Remove Duplicate Locations from checkedList
        checkedList = checkedList.filter(
            (element, i) => i === checkedList.indexOf(element)
        );
        //This adds the rooms to displayRoomListOnInit that are not stored for the saved locations/rooms in user settings
        this.addRoomsForSelectedLocationsNotSavedInUserSettings(checkedList);

        //This is the location list that will display the locations
        this.setDisplayLocationListOnInit(locationList);
        //This is the list that holds the selected locations
        this.setSelectedLocationListOnInit(checkedList);
        //This is the room list that will display the rooms
        this.setDisplayRoomListOnInit(this.displayRoomListOnInit);
        //This is the list that holds the selected rooms
        this.setSelectedRoomListOnInit(this.selectedRoomListOnInit);
    }
    
    //This performs the logic to set the providers and select the locations for the providers that are stored in user settings for the selected global location
    getGlobalLocationProvidersForUserSettings(locationList, scheduleColumnOrder, defaultLocationId) {
        let checkedList = [];
        this.selectedProviderListOnInit = [];
        this.displayProviderListOnInit = [];
        this.selectedLocationListOnInit = [];
        this.displayLocationListOnInit = [];

        let scheduleColumnOrderResult = scheduleColumnOrder.filter(function (scheduleColumnOrder) { return scheduleColumnOrder.location === defaultLocationId });
        if (scheduleColumnOrderResult.length > 0) {
          for (var i = 0; i < scheduleColumnOrderResult[0].provider.length; i++) {
            for (var j = 0; j < locationList.length; j++) {
              for (var k = 0; k < locationList[j].Providers.length; k++) {
                 for (var l = 0; l < locationList[j].Providers[k].Locations.length; l++) {
                   
                        //Check the location to true if the location in the scheduleColumnOrderResult[0].provider[i].LocationId from user settings matches the locationId in the list
                        if (locationList[j].LocationId === scheduleColumnOrderResult[0].provider[i].LocationId) {
                            locationList[j].checked = true;
                            checkedList.push(locationList[j]);
                        }
                        else {
                          //If the locationList[j].checked property did not get set to true in the if condition, then we add the checked property and set to false here
                           if (!locationList[j].checked) {
                                    locationList[j].checked = false;
                           }
                        }


                        if (locationList[j].LocationId === locationList[j].Providers[k].Locations[l].LocationId && scheduleColumnOrderResult[0].provider[i].ProviderId === locationList[j].Providers[k].Locations[l].UserId && scheduleColumnOrderResult[0].provider[i].LocationId === locationList[j].Providers[k].Locations[l].LocationId) {
                            

                          this.selectedProviderListOnInit.push({
                             FirstName: locationList[j].Providers[k].FirstName,
                             LastName: locationList[j].Providers[k].LastName,
                             Name: locationList[j].Providers[k].FirstName + ' ' + locationList[j].Providers[k].LastName,
                             ProfessionalDesignation: locationList[j].Providers[k].ProfessionalDesignation,
                             ProviderId: locationList[j].Providers[k].Locations[l].UserId,
                             LocationId: locationList[j].Providers[k].Locations[l].LocationId,
                             ProviderTypeId: locationList[j].Providers[k].Locations[l].ProviderTypeId,
                             ShowOnSchedule: this.showOnSchedule(locationList[j].Providers[k].Locations[l].ProviderTypeId),
                             SingleLocationAbbr: locationList[j].displayText,
                             locationAbbr: locationList[j].displayText,
                             locationAbbrLocations: locationList[j].Providers[k].Locations[l].LocationId,
                             checked: true
                          });

                          this.displayProviderListOnInit.push({
                             FirstName: locationList[j].Providers[k].FirstName,
                             LastName: locationList[j].Providers[k].LastName,
                             Name: locationList[j].Providers[k].FirstName + ' ' + locationList[j].Providers[k].LastName,
                             ProfessionalDesignation: locationList[j].Providers[k].ProfessionalDesignation,
                             ProviderId: locationList[j].Providers[k].Locations[l].UserId,
                             LocationId: locationList[j].Providers[k].Locations[l].LocationId,
                             ProviderTypeId: locationList[j].Providers[k].Locations[l].ProviderTypeId,
                             ShowOnSchedule: this.showOnSchedule(locationList[j].Providers[k].Locations[l].ProviderTypeId),
                             SingleLocationAbbr: locationList[j].displayText,
                             locationAbbr: locationList[j].displayText,
                             locationAbbrLocations: locationList[j].Providers[k].Locations[l].LocationId,
                             checked: true
                          });

                        }

                    }


                 }
                    //This selects the location in the checkedList if no providers for the default location are saved in the user settings
                    if (locationList[j].LocationId === defaultLocationId) {
                        let doesDefaultLocationExistInCheckedList = false;
                        doesDefaultLocationExistInCheckedList = this.doesDefaultLocationExistInCheckedList(checkedList, defaultLocationId);
                        if (!doesDefaultLocationExistInCheckedList) {
                            locationList[j].checked = true;
                            checkedList.push(locationList[j]);
                        }
                    }
              }
            }
        }

        //Remove Duplicate Locations from checkedList
        checkedList = checkedList.filter(
            (element, i) => i === checkedList.indexOf(element)
        );

        //This adds the providers to displayProviderListOnInit that are not stored for the saved locations/providers in user settings
        this.addProvidersForSelectedLocationsNotSavedInUserSettings(checkedList);

        //This is the location list that will display the locations
        this.setDisplayLocationListOnInit(locationList);
        //This is the list that holds the selected locations
        this.setSelectedLocationListOnInit(checkedList);
        //This is the provider list that will display the providers
        this.setDisplayProviderListOnInit(this.displayProviderListOnInit);
        //This is the list that holds the selected providers
        this.setSelectedProviderListOnInit(this.selectedProviderListOnInit);

    }

      
    //If no rooms were saved in user settings for the default location, we still need to add the location to the checked list
    //so rooms for the default location will get populated for the display room list
    doesDefaultLocationExistInCheckedList(checkedList, defaultLocationId) {
        let checkedListRecord;
        checkedListRecord = checkedList.filter(function (checkedList) { return checkedList.LocationId === defaultLocationId });
        if (checkedListRecord.length === 0) {
            return false;
        }
        return true;
    }

    //This will load the global location and its rooms if the user does not have user settings saved
    getDefaultGlobalLocationRooms(locationList, defaultLocationId) {
        let checkedList = [];
        this.selectedRoomListOnInit = [];
        this.displayRoomListOnInit = [];
        this.selectedLocationListOnInit = [];
        this.displayLocationListOnInit = [];
        
        for (var i = 0; i < locationList.length; i++) {
            if (locationList[i].LocationId === defaultLocationId) {
                locationList[i].checked = true;
                checkedList.push(locationList[i]);

                for (var j = 0; j < locationList[i].Rooms.length; j++) {

                    this.selectedRoomListOnInit.push({
                        Name: locationList[i].Rooms[j].Name,
                        RoomId: locationList[i].Rooms[j].RoomId,
                        LocationId: locationList[i].Rooms[j].LocationId,
                        locationAbbr: locationList[i].displayText,
                        locationAbbrLocations: [locationList[i].Rooms[j].LocationId],
                        checked: true
                    });

                    this.displayRoomListOnInit.push({
                        Name: locationList[i].Rooms[j].Name,
                        RoomId: locationList[i].Rooms[j].RoomId,
                        LocationId: locationList[i].Rooms[j].LocationId,
                        locationAbbr: locationList[i].displayText,
                        locationAbbrLocations: [locationList[i].Rooms[j].LocationId],
                        checked: true
                    });
                }
            }
            else {
                locationList[i].checked = false;
            }
        }
        //This is the location list that will display the locations
        this.setDisplayLocationListOnInit(locationList);
        //This is the list that holds the selected locations
        this.setSelectedLocationListOnInit(checkedList);
        //This is the room list that will display the rooms
        this.setDisplayRoomListOnInit(this.displayRoomListOnInit);
        //This is the list that holds the selected rooms
        this.setSelectedRoomListOnInit(this.selectedRoomListOnInit.sort((a, b) => (a.Name < b.Name ? -1 : 1)));//ONLY order checked list only when no rooms are saved in user settings
    }

    //This will load the global location and its providers if the user does not have user settings saved
    getDefaultGlobalLocationProviders(locationList, defaultLocationId) {
        let checkedList = [];
        this.selectedProviderListOnInit = [];
        this.displayProviderListOnInit = [];
        this.selectedLocationListOnInit = [];
        this.displayLocationListOnInit = [];
        let locationAbbr;

        for (var i = 0; i < locationList.length; i++) {
            if (locationList[i].LocationId === defaultLocationId) {
                locationList[i].checked = true;
                checkedList.push(locationList[i]);

                for (var j = 0; j < locationList[i].Providers.length; j++) {
                    for (var k = 0; k < locationList[i].Providers[j].Locations.length; k++) {
                        if (locationList[i].Providers[j].Locations[k].LocationId === defaultLocationId) {
                            
                            if (locationList[i].Providers[j].Locations[k].LocationId === locationList[i].LocationId) {
                                locationAbbr = locationList[i].displayText;
                            }
                            this.selectedProviderListOnInit.push({
                                FirstName: locationList[i].Providers[j].FirstName,
                                LastName: locationList[i].Providers[j].LastName,
                                Name: locationList[i].Providers[j].FirstName + ' ' + locationList[i].Providers[j].LastName,
                                ProfessionalDesignation: locationList[i].Providers[j].ProfessionalDesignation,
                                ProviderId: locationList[i].Providers[j].UserId,
                                LocationId: locationList[i].Providers[j].Locations[k].LocationId,
                                ProviderTypeId: locationList[i].Providers[j].Locations[k].ProviderTypeId,
                                ShowOnSchedule: this.showOnSchedule(locationList[i].Providers[j].Locations[k].ProviderTypeId),
                                SingleLocationAbbr: locationAbbr,
                                locationAbbr: locationAbbr,
                                locationAbbrLocations: locationList[i].Providers[j].Locations[k].LocationId,
                                checked: true
                            });

                            this.displayProviderListOnInit.push({
                                FirstName: locationList[i].Providers[j].FirstName,
                                LastName: locationList[i].Providers[j].LastName,
                                Name: locationList[i].Providers[j].FirstName + ' ' + locationList[i].Providers[j].LastName,
                                ProfessionalDesignation: locationList[i].Providers[j].ProfessionalDesignation,
                                ProviderId: locationList[i].Providers[j].UserId,
                                LocationId: locationList[i].Providers[j].Locations[k].LocationId,
                                ProviderTypeId: locationList[i].Providers[j].Locations[k].ProviderTypeId,
                                ShowOnSchedule: this.showOnSchedule(locationList[i].Providers[j].Locations[k].ProviderTypeId),
                                SingleLocationAbbr: locationAbbr,
                                locationAbbr: locationAbbr,
                                locationAbbrLocations: locationList[i].Providers[j].Locations[k].LocationId,
                                checked: true
                            });
                        }
                    }
                }
            }
            else {
                locationList[i].checked = false;
            }
        }

        //this.providerOnScheduleDropdownService.setSelectedProviderListCount(this.selectedProviderListOnInit.length);
        //This is the location list that will display the locations
        this.setDisplayLocationListOnInit(locationList);
        //This is the list that holds the selected locations
        this.setSelectedLocationListOnInit(checkedList);
        //This is the provider list that will display the providers
        this.setDisplayProviderListOnInit(this.displayProviderListOnInit.sort(this.sortOnFirstAndLast));//sort display list for providers
        //This is the list that holds the selected providers
        this.setSelectedProviderListOnInit(this.selectedProviderListOnInit.sort(this.sortOnFirstAndLast));//ONLY order checked list by first and last name when no providers are saved in user settings
    }

    //This adds the rooms to displayRoomListOnInit that are not stored for the saved locations/rooms in user settings
    //This also adds the rooms for the default location, if no default location rooms were saved in user settings
    addRoomsForSelectedLocationsNotSavedInUserSettings(checkedList) {
        let displayRoomList;
       for (var i = 0; i < checkedList.length; i++) {
          for (var j = 0; j < checkedList[i].Rooms.length; j++) {

           //if the location exists in checkedList and the room for the location is not in the displayed list, then we need to add with a checked value of false
              displayRoomList = this.displayRoomListOnInit.filter(function (displayList) { return checkedList[i].LocationId === displayList.LocationId && displayList.RoomId === checkedList[i].Rooms[j].RoomId });
            if (displayRoomList.length === 0) {
                 this.displayRoomListOnInit.push({
                    Name: checkedList[i].Rooms[j].Name,
                    RoomId: checkedList[i].Rooms[j].RoomId,
                    LocationId: checkedList[i].Rooms[j].LocationId,
                    locationAbbr: checkedList[i].displayText,
                    locationAbbrLocations: [checkedList[i].Rooms[j].LocationId],
                    checked: false
                 });
            }
          }
        }
    }

    showOnSchedule(providerId) {

        if (providerId === 1 || providerId === 2) {
            return true;
        } else {
            return false;
        }
    }

    //This adds the providers to displayProviderListOnInit that are not stored for the saved locations/providers in user settings
    //This also adds the providers for the default location, if no default location providers were saved in user settings
    addProvidersForSelectedLocationsNotSavedInUserSettings(checkedList) {
        for (var i = 0; i < checkedList.length; i++) {
            for (var j = 0; j < checkedList[i].Providers.length; j++) {
                for (var k = 0; k < checkedList[i].Providers[j].Locations.length; k++) {
                    let wasProviderFoundInSelectList = false;
                    let providerIsADuplicate = false;
                    let wasProviderInSelectedList = false;
                    let locationIdFoundOnDuplicateProvider = "";
                    let providerId = "";
                   
                    if (checkedList[i].LocationId === checkedList[i].Providers[j].Locations[k].LocationId) {
                        for (var l = 0; l < this.selectedProviderListOnInit.length; l++) {

                            if (checkedList[i].Providers[j].Locations[k].UserId === this.selectedProviderListOnInit[l].ProviderId) {
                                if (checkedList[i].Providers[j].Locations[k].LocationId === this.selectedProviderListOnInit[l].LocationId) {
                                    wasProviderFoundInSelectList = true;
                                }
                            }


                            if (checkedList[i].Providers[j].Locations[k].UserId === this.selectedProviderListOnInit[l].ProviderId) {
                                if (checkedList[i].Providers[j].Locations[k].LocationId !== this.selectedProviderListOnInit[l].LocationId) {
                                    locationIdFoundOnDuplicateProvider = checkedList[i].Providers[j].Locations[k].LocationId;
                                    providerId = checkedList[i].Providers[j].Locations[k].UserId;
                                    providerIsADuplicate = true;
                                }
                            }
                        }

                        if (wasProviderFoundInSelectList === false) {
                           //If provider is a duplicate and the provider was is in selected list, then add them to the this.displayProviderListOnInit and the this.selectedProviderListOnInit
                            if (providerIsADuplicate) {
                                                            
                                    if (checkedList[i].Providers[j].Locations[k].LocationId === locationIdFoundOnDuplicateProvider) {
                                        if (checkedList[i].Providers[j].Locations[k].UserId === providerId) {
                                            wasProviderInSelectedList = true;
                                            this.selectedProviderListOnInit.push({
                                                FirstName: checkedList[i].Providers[j].FirstName,
                                                LastName: checkedList[i].Providers[j].LastName,
                                                Name: checkedList[i].Providers[j].FirstName + ' ' + checkedList[i].Providers[j].LastName,
                                                ProfessionalDesignation: checkedList[i].Providers[j].ProfessionalDesignation,
                                                ProviderId: checkedList[i].Providers[j].Locations[k].UserId,
                                                LocationId: checkedList[i].Providers[j].Locations[k].LocationId,
                                                ProviderTypeId: checkedList[i].Providers[j].Locations[k].ProviderTypeId,
                                                ShowOnSchedule: this.showOnSchedule(checkedList[i].Providers[j].Locations[k].ProviderTypeId),
                                                SingleLocationAbbr: checkedList[i].displayText,
                                                locationAbbr: checkedList[i].displayText,
                                                locationAbbrLocations: checkedList[i].Providers[j].Locations[k].LocationId,
                                                checked: true
                                            });
                                            this.displayProviderListOnInit.push({
                                                FirstName: checkedList[i].Providers[j].FirstName,
                                                LastName: checkedList[i].Providers[j].LastName,
                                                Name: checkedList[i].Providers[j].FirstName + ' ' + checkedList[i].Providers[j].LastName,
                                                ProfessionalDesignation: checkedList[i].Providers[j].ProfessionalDesignation,
                                                ProviderId: checkedList[i].Providers[j].Locations[k].UserId,
                                                LocationId: checkedList[i].Providers[j].Locations[k].LocationId,
                                                ProviderTypeId: checkedList[i].Providers[j].Locations[k].ProviderTypeId,
                                                ShowOnSchedule: this.showOnSchedule(checkedList[i].Providers[j].Locations[k].ProviderTypeId),
                                                SingleLocationAbbr: checkedList[i].displayText,
                                                locationAbbr: checkedList[i].displayText,
                                                locationAbbrLocations: checkedList[i].Providers[j].Locations[k].LocationId,
                                                checked: true
                                            });
                                        }
                                    }
                            }


                            //If provider was not a duplicate and the provider was not in selected list, then only add them to the this.displayProviderListOnInit
                            if (!wasProviderInSelectedList) {
                                this.displayProviderListOnInit.push({
                                    FirstName: checkedList[i].Providers[j].FirstName,
                                    LastName: checkedList[i].Providers[j].LastName,
                                    Name: checkedList[i].Providers[j].FirstName + ' ' + checkedList[i].Providers[j].LastName,
                                    ProfessionalDesignation: checkedList[i].Providers[j].ProfessionalDesignation,
                                    ProviderId: checkedList[i].Providers[j].Locations[k].UserId,
                                    LocationId: checkedList[i].Providers[j].Locations[k].LocationId,
                                    ProviderTypeId: checkedList[i].Providers[j].Locations[k].ProviderTypeId,
                                    ShowOnSchedule: this.showOnSchedule(checkedList[i].Providers[j].Locations[k].ProviderTypeId),
                                    SingleLocationAbbr: checkedList[i].displayText,
                                    locationAbbr: checkedList[i].displayText,
                                    locationAbbrLocations: checkedList[i].Providers[j].Locations[k].LocationId,
                                    checked: false
                                });
                            }
                        }
                    }
                }
            }
        }
    }
}
