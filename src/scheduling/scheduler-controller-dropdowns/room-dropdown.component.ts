import { Component, EventEmitter, OnInit, Output, OnDestroy, Renderer2, ViewChild, SimpleChanges, Input } from '@angular/core';
import { RoomDropdownService } from '../providers/room-dropdown.service';
import { LocationDropdownService } from '../providers/location-dropdown.service';
import { Subscription } from 'rxjs';
import { ElementRef } from '@angular/core';

declare var angular: angular.IAngularStatic;

@Component({
    selector: 'room-dropdown',
    templateUrl: 'room-dropdown.component.html',
    styleUrls: ['./scheduler-dropdowns.component.scss']
})

export class RoomDropdownComponent implements OnInit, OnDestroy {
    //Input Properties - Parent to Child
    @Input() reorderColumnsChanged: any;
    @Input() currentScheduleView: any;
    @Input() globalSelectedLocation: any;
    //Output Properties - Child To Parent
    @Output() shareCheckedList = new EventEmitter();
    @Output() locationDropdownLoaded = new EventEmitter();

    list: { Name: string, RoomId: number, LocationId: number, locationAbbr: string, locationAbbrLocations: number[], checked: boolean }[] = [];
    checkedList: { Name: string, RoomId: number, LocationId: number, locationAbbr: string, locationAbbrLocations: number[], checked: boolean} [] = [];
    currentSelected: {};
    masterSelected: boolean;
    showDropDown: boolean = false;
    roomDropdownServiceSubscription: Subscription;
    locationDropdownServiceLostFocusSubscription: Subscription;

    @ViewChild('toggleButton', { static: false }) toggleButton: ElementRef;
    @ViewChild('menu', { static: false }) menu: ElementRef;
    @ViewChild('caretButton', { static: false }) caretButton: ElementRef;

    windowClickListenerFn: () => void;
        
    constructor(private roomDropdownService: RoomDropdownService, private locationDropdownService: LocationDropdownService, private renderer: Renderer2) {

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
        
        this.roomDropdownServiceSubscription = roomDropdownService.getRoomsForSelectedLocations().subscribe((roomList) => {
            if (roomList) {

                this.checkedList = [];
                this.checkedList = angular.copy(roomList);

                this.roomDropdownService.setSelectedRoomList(this.checkedList);
            }
            
        },
            (error) => { console.log(error) });

        this.roomDropdownServiceSubscription = roomDropdownService.getRoomsForDisplayedLocations().subscribe((roomList) => {
            if (roomList) {
                this.list = [];
                this.list = angular.copy(roomList);

                this.roomDropdownService.setDisplayRoomList(this.list.sort((a, b) => (a.Name < b.Name ? -1 : 1)));

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
        //This will emit the rooms to the scheduler-controller when the location loses focus
        //We subscribe to an event in the location-dropdown.service
        this.locationDropdownServiceLostFocusSubscription = this.locationDropdownService.lostFocusEvent
            .subscribe((data: string) => {
                //console.log('Event message from Location Dropdown: ' + data);
                this.emitValues();
            });
    }

    btnClick() {
        this.showDropDown = !this.showDropDown;
    }
  
    getSelectedValue(list: any) {
        if (list.checked) {
            this.checkedList.push(list);
        } else {
            var index = this.checkedList.findIndex(x => x.RoomId === list.RoomId);
            this.checkedList.splice(index, 1);
        }

        this.areAllCheckedOrAllUnchecked();
        this.roomDropdownService.setDisplayRoomList(this.list);
        this.roomDropdownService.setSelectedRoomList(this.checkedList);
    }

    //Check Select All checkbox if all checkboxes checked
    //Uncheck Select All checkbox if all checkboxes are not checked
    areAllCheckedOrAllUnchecked() {
        if (this.checkedList.length === this.list.length) {
            this.masterSelected = true;
        }

        if (this.checkedList.length < this.list.length) {
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

        this.roomDropdownService.setDisplayRoomList(this.list);
        this.roomDropdownService.setSelectedRoomList(this.checkedList);
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
            //if reorder columns change for room, we need to set our checkedList in the proper order
            if (property === 'reorderColumnsChanged' && changes.reorderColumnsChanged.currentValue && changes.reorderColumnsChanged.currentValue.length > 0) {
                this.checkedList = [];
                this.roomDropdownService.setSelectedRoomList(changes.reorderColumnsChanged.currentValue);
                this.checkedList = angular.copy(this.roomDropdownService.getSelectedRoomList());
                this.emitValues();
               
            }
        }
    }
     
    ngOnDestroy() {
        if (this.shareCheckedList) {
            this.shareCheckedList.unsubscribe();
        }

        if (this.roomDropdownServiceSubscription) {
            this.roomDropdownServiceSubscription.unsubscribe();
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
