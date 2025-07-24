import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
declare var angular: angular.IAngularStatic;


@Injectable()
export class ProviderOnScheduleDropdownService {
    private displayProviderListSubject = new BehaviorSubject(null);
    private selectedProviderListSubject = new BehaviorSubject(null);
    private displayProviderList: any = [];
    private selectedProviderList: any = [];
       
    constructor(@Inject('ProviderShowOnScheduleFactory') private showOnScheduleFactory, @Inject('referenceDataService') private referenceDataService ) {

    }

    //Get ShowOnScheduleExceptions
    async getShowOnScheduleExceptions() {
        let getAll = await this.showOnScheduleFactory.getAll();
        return getAll;
    }
    
	async getProvidersForLocations(locationsList) {
        let providerList = this.getProvidersFromCache();
        let showExceptionList = await this.getShowOnScheduleExceptions();
        let provList = null;
        if (!providerList) {
            provList = this.referenceDataService.get(this.referenceDataService.entityNames.users)
        }
        else {
            provList = providerList.CachedObj;
        }

            let found = false;

            for (var i = 0; i < locationsList.length; i++) {
                locationsList[i].Providers = [];

                for (var j = 0; j < provList.length; j++) {
                    found = false;
                    if (provList[j].Locations.length > 0) {
                        for (var k = 0; k < provList[j].Locations.length; k++) {
                            if (locationsList[i].LocationId === provList[j].Locations[k].LocationId && (provList[j].Locations[k].ProviderTypeId === 1 || provList[j].Locations[k].ProviderTypeId === 2 || provList[j].Locations[k].ProviderTypeId === 5)) {
                                for (var l = 0; l < showExceptionList.Value.length; l++) {

                                    if (provList[j].Locations[k].LocationId === showExceptionList.Value[l].LocationId && showExceptionList.Value[l].UserId === provList[j].Locations[k].UserId) {
                                        found = true;
                                        if (showExceptionList.Value[l].ShowOnSchedule === true) {
                                            locationsList[i].Providers.push(provList[j]);
                                        }

                                    }
                                }
                                if (found === false) {
                                    locationsList[i].Providers.push(provList[j]);
                                }

                            }
                        }
                    }
                }
            }
            this.setDisplayProviderList(provList);
    }

    //This is called from provider-on-schedule-dropdown.component to set the providers on initialization or when the list changes
    setDisplayProviderList(providerList) {
        this.displayProviderList = angular.copy(providerList);
    }

    //This is called from provider-on-schedule-dropdown.component to set the providers on initialization or when the list changes
    setSelectedProviderList(checkedList) {
        this.selectedProviderList = angular.copy(checkedList);
    }

    
    getDisplayProviderList() {
        return this.displayProviderList;
    }

   
    getSelectedProviderList() {
       return this.selectedProviderList;
    }

    //This is called when Select All for Locations is selected
    addAllProvidersForAllLocations(selectedLocationList) {
        let displayProviderListBeforeNewlySelectedLocationAdded = angular.copy(this.displayProviderList);
        this.selectedProviderList = [];//Do not want to call observable get. We don't want it to emit to scheduler-controller
        this.displayProviderList = [];//Do not want to call observable get. We don't want it to emit to scheduler-controller
        let isDuplicateProviderInDisplayList = false;
        let locationAbbr;

        for (var i = 0; i < selectedLocationList.length; i++) {
            //This will execute secondly after the else. This will add the new location and its providers.
                for (var j = 0; j < selectedLocationList[i].Providers.length; j++) {
                    for (var k = 0; k < selectedLocationList[i].Providers[j].Locations.length; k++) {
                        
                        locationAbbr = selectedLocationList[i].displayText;

                        if (selectedLocationList[i].Providers[j].Locations[k].LocationId === selectedLocationList[i].LocationId) {
                            isDuplicateProviderInDisplayList = this.isDuplicateProviderInDisplayList(selectedLocationList[i].Providers[j], selectedLocationList[i].Providers[j].Locations[k], displayProviderListBeforeNewlySelectedLocationAdded, locationAbbr);

                            if (!isDuplicateProviderInDisplayList) {
                                this.selectedProviderList.push({
                                    FirstName: selectedLocationList[i].Providers[j].FirstName,
                                    LastName: selectedLocationList[i].Providers[j].LastName,
                                    Name: selectedLocationList[i].Providers[j].FirstName + ' ' + selectedLocationList[i].Providers[j].LastName,
                                    ProfessionalDesignation: selectedLocationList[i].Providers[j].ProfessionalDesignation,
                                    ProviderId: selectedLocationList[i].Providers[j].Locations[k].UserId,
                                    LocationId: selectedLocationList[i].Providers[j].Locations[k].LocationId,
                                    ShowOnSchedule: this.showOnSchedule(selectedLocationList[i].Providers[j].Locations[k].ProviderTypeId),
                                    ProviderTypeId: selectedLocationList[i].Providers[j].Locations[k].ProviderTypeId,
                                    SingleLocationAbbr: locationAbbr,
                                    locationAbbr: locationAbbr,
                                    locationAbbrLocations: selectedLocationList[i].Providers[j].Locations[k].LocationId,
                                    checked: true
                                });

                                this.displayProviderList.push({
                                    FirstName: selectedLocationList[i].Providers[j].FirstName,
                                    LastName: selectedLocationList[i].Providers[j].LastName,
                                    Name: selectedLocationList[i].Providers[j].FirstName + ' ' + selectedLocationList[i].Providers[j].LastName,
                                    ProfessionalDesignation: selectedLocationList[i].Providers[j].ProfessionalDesignation,
                                    ProviderId: selectedLocationList[i].Providers[j].Locations[k].UserId,
                                    LocationId: selectedLocationList[i].Providers[j].Locations[k].LocationId,
                                    ShowOnSchedule: this.showOnSchedule(selectedLocationList[i].Providers[j].Locations[k].ProviderTypeId),
                                    ProviderTypeId: selectedLocationList[i].Providers[j].Locations[k].ProviderTypeId,
                                    SingleLocationAbbr: locationAbbr,
                                    locationAbbr: locationAbbr,
                                    locationAbbrLocations: selectedLocationList[i].Providers[j].Locations[k].LocationId,
                                    checked: true
                                });
                            }
                        }
                    }
                }
        }

        this.selectedProviderListSubject.next(this.selectedProviderList);
        this.displayProviderListSubject.next(this.displayProviderList);

    }

    //This is called when Select All for Locations is deselected
    removeAllProvidersForAllLocations() {
        this.selectedProviderList = [];
        this.displayProviderList = [];
        this.selectedProviderListSubject.next(this.selectedProviderList);
        this.displayProviderListSubject.next(this.displayProviderList);
    }

    //This is called when a location is selected in location dropdown
    //Intent is to have duplicate providers for different locatios be saved in the selectedProviderList for the location to save in User Settings if checked is true, but
    //we only want to display the provider once in the provider dropdown list so we only have them in the displayProviderList once
    //All the providers for the newly added location should be checked unless the same provider was unchecked from a previously selected location
    //http://www.mukeshkumar.net/articles/angular5/share-data-between-sibling-components-in-angular-5-using-rxjs-behaviorsubject
    addProvidersForNewlySelectedLocation(selectedLocationList, locationId) {
        let displayProviderListBeforeNewlySelectedLocationAdded = angular.copy(this.displayProviderList);
        this.selectedProviderList = this.getSelectedProviderList();//Do not want to call observable get. We don't want it to emit to scheduler-controller
        this.displayProviderList = this.getDisplayProviderList();//Do not want to call observable get. We don't want it to emit to scheduler-controller
        let isDuplicateProviderInDisplayList = false;
        let locationAbbr;

        for (var i = 0; i < selectedLocationList.length; i++) {
            //This will execute secondly after the else. This will add the new location and its providers.
            if (selectedLocationList[i].LocationId === locationId) {
                for (var j = 0; j < selectedLocationList[i].Providers.length; j++) {
                    for (var k = 0; k < selectedLocationList[i].Providers[j].Locations.length; k++) {
                        if (selectedLocationList[i].Providers[j].Locations[k].LocationId === locationId) {

                            locationAbbr = selectedLocationList[i].displayText;

                            if (selectedLocationList[i].Providers[j].Locations[k].LocationId === selectedLocationList[i].LocationId) {
                                isDuplicateProviderInDisplayList = this.isDuplicateProviderInDisplayList(selectedLocationList[i].Providers[j], selectedLocationList[i].Providers[j].Locations[k], displayProviderListBeforeNewlySelectedLocationAdded,locationAbbr);

                                if (!isDuplicateProviderInDisplayList) {
                                    this.selectedProviderList.push({
                                        FirstName: selectedLocationList[i].Providers[j].FirstName,
                                        LastName: selectedLocationList[i].Providers[j].LastName,
                                        Name: selectedLocationList[i].Providers[j].FirstName + ' ' + selectedLocationList[i].Providers[j].LastName,
                                        ProfessionalDesignation: selectedLocationList[i].Providers[j].ProfessionalDesignation,
                                        ProviderId: selectedLocationList[i].Providers[j].Locations[k].UserId,
                                        LocationId: selectedLocationList[i].Providers[j].Locations[k].LocationId,
                                        ShowOnSchedule: this.showOnSchedule(selectedLocationList[i].Providers[j].Locations[k].ProviderTypeId),
                                        ProviderTypeId: selectedLocationList[i].Providers[j].Locations[k].ProviderTypeId,
                                        SingleLocationAbbr: locationAbbr,
                                        locationAbbr: locationAbbr,
                                        locationAbbrLocations: selectedLocationList[i].Providers[j].Locations[k].LocationId,
                                        checked: true
                                    });

                                    this.displayProviderList.push({
                                        FirstName: selectedLocationList[i].Providers[j].FirstName,
                                        LastName: selectedLocationList[i].Providers[j].LastName,
                                        Name: selectedLocationList[i].Providers[j].FirstName + ' ' + selectedLocationList[i].Providers[j].LastName,
                                        ProfessionalDesignation: selectedLocationList[i].Providers[j].ProfessionalDesignation,
                                        ProviderId: selectedLocationList[i].Providers[j].Locations[k].UserId,
                                        LocationId: selectedLocationList[i].Providers[j].Locations[k].LocationId,
                                        ShowOnSchedule: this.showOnSchedule(selectedLocationList[i].Providers[j].Locations[k].ProviderTypeId),
                                        ProviderTypeId: selectedLocationList[i].Providers[j].Locations[k].ProviderTypeId,
                                        SingleLocationAbbr: locationAbbr,
                                        locationAbbr: locationAbbr,
                                        locationAbbrLocations: selectedLocationList[i].Providers[j].Locations[k].LocationId,
                                        checked: true
                                    });
                                }
                            }

                        }
                    }
                }
            }

        }

        this.selectedProviderListSubject.next(this.selectedProviderList);
        this.displayProviderListSubject.next(this.displayProviderList);
    }

    showOnSchedule(providerId) {
        if (providerId === 1 || providerId === 2) {
            return true;
        } else {
            return false;
        }
    }

    //If there is a duplicate provider added from the newest selected location and that provider exists for another selected location, 
    //then set the checked property on displayProviderList to the existing checked property from the previously selected duplicate provider.
    //If the checked property is set to true, then add the duplicate provider record to the selectedProviderList to save to User Settings later.
    //Also, add the duplicate provider record to displayProviderList when checked is true or false.
    isDuplicateProviderInDisplayList(providers, locations, displayProviderListBeforeNewlySelectedLocationAdded, locationAbbr) {
        let found = false;
               
        for (var i = 0; i < displayProviderListBeforeNewlySelectedLocationAdded.length; i++) {
            if (displayProviderListBeforeNewlySelectedLocationAdded[i].ProviderId === providers.UserId) {
                if (displayProviderListBeforeNewlySelectedLocationAdded[i].checked) {
                    this.selectedProviderList.push({
                        FirstName: providers.FirstName,
                        LastName: providers.LastName,
                        Name: providers.FirstName + ' ' + providers.LastName,
                        ProfessionalDesignation: providers.ProfessionalDesignation,
                        ProviderId: locations.UserId,
                        LocationId: locations.LocationId,
                        ShowOnSchedule: this.showOnSchedule(locations.ProviderTypeId),
                        ProviderTypeId: locations.ProviderTypeId,
                        SingleLocationAbbr: locationAbbr,
                        locationAbbr: locationAbbr,
                        locationAbbrLocations: locations.LocationId,
                        checked: displayProviderListBeforeNewlySelectedLocationAdded[i].checked //Take the checked property from the displayProviderListBeforeNewlySelectedLocationAdded to save for the new locationId and store in user settings
                    });
                }


                this.displayProviderList.push({
                    FirstName: providers.FirstName,
                    LastName: providers.LastName,
                    Name: providers.FirstName + ' ' + providers.LastName,
                    ProfessionalDesignation: providers.ProfessionalDesignation,
                    ProviderId: locations.UserId,
                    LocationId: locations.LocationId,
                    ShowOnSchedule: this.showOnSchedule(locations.ProviderTypeId),
                    ProviderTypeId: locations.ProviderTypeId,
                    SingleLocationAbbr: locationAbbr,
                    locationAbbr: locationAbbr,
                    locationAbbrLocations: locations.LocationId,
                    checked: displayProviderListBeforeNewlySelectedLocationAdded[i].checked //Take the checked property from the displayProviderListBeforeNewlySelectedLocationAdded to save for the new locationId and store in user settings
                });
                

                found = true;
                break;
            }
        }
        return found;
    }
         
    //http://www.mukeshkumar.net/articles/angular5/share-data-between-sibling-components-in-angular-5-using-rxjs-behaviorsubject
    addProvidersForInitializingLocation(selectedLocationList, displayProviderList) {

        this.selectedProviderListSubject.next(selectedLocationList);
        this.displayProviderListSubject.next(displayProviderList);

    }

    //This is called when a location is deselected in location dropdown
    removeProvidersForDeselectedLocation(locationId) {

        this.selectedProviderList = this.selectedProviderList.filter(itemInArray => itemInArray.LocationId !== locationId);
        this.displayProviderList = this.displayProviderList.filter(itemInArray => itemInArray.LocationId !== locationId);

        this.selectedProviderListSubject.next(this.selectedProviderList);
        this.displayProviderListSubject.next(this.displayProviderList);
    }

    //We subscribe to this method
    getProvidersForSelectedLocations() {
        return this.selectedProviderListSubject.asObservable();
    }
    //We subscribe to this method
    getProvidersForDisplayedLocations() {
        return this.displayProviderListSubject.asObservable();
    }

    getProvidersFromCache() {
       return JSON.parse(localStorage.getItem('cachedUsers_v2'));
    }

}
