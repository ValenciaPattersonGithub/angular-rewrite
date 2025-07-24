import { Component, EventEmitter, OnInit,Input, Output, OnDestroy, ElementRef, ViewChild, SimpleChanges, AfterViewInit } from '@angular/core';
import { ProviderOnScheduleDropdownService } from '../providers/provider-on-schedule-dropdown.service';
import { LocationDropdownService } from '../providers/location-dropdown.service';
import { Subscription } from 'rxjs';
import { Renderer2 } from '@angular/core';

declare var angular: angular.IAngularStatic;

@Component({
    selector: 'provider-on-schedule-dropdown',
    templateUrl: 'provider-on-schedule-dropdown.component.html',
    styleUrls: ['./scheduler-dropdowns.component.scss']
})

export class ProviderOnScheduleDropdownComponent implements OnInit, AfterViewInit, OnDestroy {
    //Input Properties - Parent to Child
    @Input() reorderColumnsChanged: any;
    @Input() currentScheduleView: any;
    @Input() globalSelectedLocation: any;
    //Output Properties - Child To Parent
    @Output() shareCheckedList = new EventEmitter();
    @Output() locationDropdownLoaded = new EventEmitter();

    //This is the list that populates the providers dropdown
    list: { FirstName: string, LastName: string, Name: string, ProfessionalDesignation: string, ProviderId: number, LocationId: number, ProviderTypeId: number, ShowOnSchedule: boolean, SingleLocationAbbr: string, locationAbbr: string, locationAbbrLocations: number[], checked: boolean }[] = [];
    //This is the list that contains the selected providers
    checkedList: { FirstName: string, LastName: string, Name: string, ProfessionalDesignation: string, ProviderId: number, LocationId: number, ProviderTypeId: number, ShowOnSchedule: boolean, SingleLocationAbbr: string, locationAbbr: string, locationAbbrLocations: number[], checked: boolean }[] = [];
    currentSelected: {};
    masterSelected: boolean;
    showDropDown: boolean = false;
    providerOnScheduleDropdownServiceSubscription: Subscription;
    locationDropdownServiceLostFocusSubscription: Subscription;
    //This is the list that contains a unique set of providers so we can keep track of our list display count
    uniqueList: { FirstName: string, LastName: string, Name: string, ProfessionalDesignation: string, ProviderId: number, LocationId: number, ProviderTypeId: number, ShowOnSchedule: boolean, SingleLocationAbbr: string, locationAbbr: string, locationAbbrLocations: number[], checked: boolean }[] = [];
    //This is the list that contains a unique set of selected providers so we can keep track of our checkedList count
    uniqueCheckedList: { FirstName: string, LastName: string, Name: string, ProfessionalDesignation: string, ProviderId: number, LocationId: number, ProviderTypeId: number, ShowOnSchedule: boolean, SingleLocationAbbr: string, locationAbbr: string, locationAbbrLocations: number[], checked: boolean }[] = [];

    @ViewChild('toggleButton', { static: false }) toggleButton: ElementRef;
    @ViewChild('menu', { static: false }) menu: ElementRef;
    @ViewChild('caretButton', { static: false }) caretButton: ElementRef;
   
    windowClickListenerFn: () => void;
         
    constructor(private providerOnScheduleDropdownService: ProviderOnScheduleDropdownService, private locationDropdownService: LocationDropdownService, private renderer: Renderer2) {
      
        /**
           * This events get called by all clicks on the page
        */
        this.windowClickListenerFn = this.renderer.listen('window', 'click', (e: Event) => {
            /**
             * Only run when toggleButton is not clicked
             * If we don't check this, all clicks (even on the toggle button) gets into this
             * section which in the result we might never see the menu open!
             * And the menu itself is checked here, and it's where we check just outside of
             * the menu and button the condition abbove must close the menu
             */
            if (e.target !== this.caretButton.nativeElement && e.target !== this.toggleButton.nativeElement && e.target !== this.menu.nativeElement && !this.menu.nativeElement.contains(e.target)) {
                this.showDropDown = false;
            }
        });

        this.masterSelected = false;

        this.providerOnScheduleDropdownServiceSubscription = providerOnScheduleDropdownService.getProvidersForSelectedLocations().subscribe((providerList) => {
            if (providerList) {
                this.checkedList = [];
                this.checkedList = angular.copy(providerList);

                this.providerOnScheduleDropdownService.setSelectedProviderList(this.checkedList);
            }
           
        },
            (error) => { console.log(error) });

        this.providerOnScheduleDropdownServiceSubscription = providerOnScheduleDropdownService.getProvidersForDisplayedLocations().subscribe((providerList) => {
            if (providerList) {
                this.list = [];
                this.list = angular.copy(providerList);
                
                this.providerOnScheduleDropdownService.setDisplayProviderList(this.list.sort(this.sortOnFirstAndLast));
              
                this.areAllCheckedOrAllUnchecked();

                //We only emit here when the schedule page is performing on initialization of user settings
                //Otherwise we don't emit until location dropdown loses focus or when column order changes
                //We don't want emit to fire everytime a location changes
                if (this.locationDropdownService.retrievingDefaultSettings) {
                    this.locationDropdownLoaded.emit(true);
                    this.locationDropdownService.retrievingDefaultSettings = false;
                    this.emitValues();
                }
            }
           
        },
            (error) => { console.log(error) });
              
    }

    ngOnInit() {
       
        //This will emit the providers to the scheduler-controller when the location loses focus
        //We subscribe to an event in the location-dropdown.service
        this.locationDropdownServiceLostFocusSubscription = this.locationDropdownService.lostFocusEvent
            .subscribe((data: string) => {
                //console.log('Event message from Location Dropdown: ' + data);
                this.emitValues();
            });
    }

    ngAfterViewInit() {
                  
    }

    //This sorts the list by Last Name and then by First Name
    sortOnFirstAndLast(a, b) {

        const result = a.LastName.localeCompare(b.LastName);

        return result !== 0 ? result : a.FirstName.localeCompare(b.FirstName);
    }
    

    btnClick() {
        this.showDropDown = !this.showDropDown;
    }
  
   
    getSelectedValue(list: any) {
        if (list.checked) {
            this.checkedList.push(list);
            this.addDuplicateProvidersToCheckedListAndSelectThemInList(list);
        } else {
            this.checkedList = this.removeDuplicateProvidersFromCheckedList(list);
            this.uncheckDuplicateProvidersFromList(list);
        }

        this.areAllCheckedOrAllUnchecked();
        this.providerOnScheduleDropdownService.setDisplayProviderList(this.list);
        this.providerOnScheduleDropdownService.setSelectedProviderList(this.checkedList);
    }

    //This adds a duplicate provider with a different location to the checkedList and selects them in the this.list
    addDuplicateProvidersToCheckedListAndSelectThemInList(list) {
        this.list.filter(e => {
            if (e.ProviderId === list.ProviderId && list.LocationId !== e.LocationId) {
                e.checked = true;
                this.checkedList.push(e);
            }
        });
    }

    //This takes the newly unchecked provider record and removes duplicate providers (if any) from the this.checkedList
    removeDuplicateProvidersFromCheckedList(list): any {
        this.checkedList = this.checkedList.filter(function (e) {
            return e.ProviderId !== list.ProviderId;
        });
        return this.checkedList;
    }

    //This takes the newly unchecked provider record and unchecks the duplicate providers (if any) from the this.list
    uncheckDuplicateProvidersFromList(list) {
        this.list.filter(e => {
            if (e.ProviderId === list.ProviderId && list.LocationId !== e.LocationId) {
                e.checked = false;
            }
        });
    }

    //Returns the unique list values from this.list. Excludes duplicate providers
    getUniqueValuesInList(): any{
        const uniqueList = [...new Set(this.list.map(item => item.ProviderId))];
        return uniqueList;
    }

    //Returns the unique list values from this.checkedLsit. Excludes duplicate providers
    //This list is used to display the count on the provider dropdown button
    getUniqueValuesInCheckedList(): any {
        const uniqueList = [...new Set(this.checkedList.map(item => item.ProviderId))];
        return uniqueList;
    }

    //Check Select All checkbox if all checkboxes checked
    //Uncheck Select All checkbox if all checkboxes are not checked
    areAllCheckedOrAllUnchecked() {
        this.uniqueList = this.getUniqueValuesInList();
        this.uniqueCheckedList = this.getUniqueValuesInCheckedList();
        
        if (this.uniqueCheckedList.length === this.uniqueList.length) {
            this.masterSelected = true;
        }

        if (this.uniqueCheckedList.length  < this.uniqueList.length) {
            this.masterSelected = false;
        }
    }

    //This gets called when the Select All checkbox is checked
    selectOrDeselectAllValues(event) {
        this.checkedList = [];
        if (event.target.checked) {
            for (var i = 0; i < this.list.length; i++) {
                this.list[i].checked = true;
                this.checkedList.push(this.list[i]);

            }
        } else {
            this.list.forEach(function (value) {
                value.checked = false;
            });
        }

        this.uniqueList = this.getUniqueValuesInList();
        this.uniqueCheckedList = this.getUniqueValuesInCheckedList();

        this.providerOnScheduleDropdownService.setDisplayProviderList(this.list);
        this.providerOnScheduleDropdownService.setSelectedProviderList(this.checkedList);
    }
       
    emitValues() {
       //share checked list
        this.shareCheckedlist();
    }

    shareCheckedlist() {
        this.shareCheckedList.emit(this.checkedList);
    }

    ngOnChanges(changes: SimpleChanges) {
        for (let property in changes) {
            //if reorder columns change for provider, we need to set our checkedList in the proper order
            if (property === 'reorderColumnsChanged' && changes.reorderColumnsChanged.currentValue && changes.reorderColumnsChanged.currentValue.length > 0) {

                this.checkedList = [];
                this.providerOnScheduleDropdownService.setSelectedProviderList(changes.reorderColumnsChanged.currentValue);
                this.checkedList = angular.copy(this.providerOnScheduleDropdownService.getSelectedProviderList());
                this.emitValues();
            }
 
        }
    }
     
    ngOnDestroy() {
        if (this.shareCheckedList) {
            this.shareCheckedList.unsubscribe();
        }

        if (this.providerOnScheduleDropdownServiceSubscription) {
            this.providerOnScheduleDropdownServiceSubscription.unsubscribe();
        }

        if (this.windowClickListenerFn) {
            this.windowClickListenerFn();
        }

        if (this.locationDropdownServiceLostFocusSubscription) {
            this.locationDropdownServiceLostFocusSubscription.unsubscribe();
        }

        if (this.locationDropdownLoaded) {
            this.locationDropdownLoaded.unsubscribe();
        }
    }


}
