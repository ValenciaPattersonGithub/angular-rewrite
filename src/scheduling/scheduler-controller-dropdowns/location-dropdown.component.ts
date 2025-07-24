import {
  Component,
  EventEmitter,
  OnInit,
  Input,
  Output,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { LocationDropdownService } from '../providers/location-dropdown.service';
import { RoomDropdownService } from '../providers/room-dropdown.service';
import { ProviderOnScheduleDropdownService } from '../providers/provider-on-schedule-dropdown.service';
import { Renderer2 } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'location-dropdown',
  templateUrl: 'location-dropdown.component.html',
  styleUrls: ['./scheduler-dropdowns.component.scss'],
})
export class LocationDropdownComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  //Input Properties - Parent to Child
  @Input() list: any;
  @Input() globalSelectedLocation: any;
  @Input() currentScheduleView: any;
  //Output Properties - Child To Parent
  @Output() shareCheckedList = new EventEmitter();

  checkedList: any[];
  currentSelected: {};
  masterSelected: boolean = false;
  showDropDown: boolean = false;

  @ViewChild('toggleButton', { static: false }) toggleButton: ElementRef;
  @ViewChild('menu', { static: false }) menu: ElementRef;
  @ViewChild('caretButton', { static: false }) caretButton: ElementRef;

  windowClickListenerFn: () => void;

  constructor(
    private locationDropdownService: LocationDropdownService,
    private roomDropdownService: RoomDropdownService,
    private providerOnScheduleDropdownService: ProviderOnScheduleDropdownService,
    private renderer: Renderer2
  ) {
    /**
     * This events get called by all clicks on the page
     */
    this.windowClickListenerFn = this.renderer.listen(
      'window',
      'click',
      (e: Event) => {
        /**
         * Only run when toggleButton is not clicked
         * If we don't check this, all clicks (even on the toggle button) gets into this
         * section which in the result we might never see the menu open!
         * And the menu itself is checked here, and it's where we check just outside of
         * the menu and button the condition abbove must close the menu
         */
        if (
          e.target !== this.caretButton.nativeElement &&
          e.target !== this.toggleButton.nativeElement &&
          e.target !== this.menu.nativeElement &&
          !this.menu.nativeElement.contains(e.target)
        ) {
          this.showDropDown = false;
        }
      }
    );
  }

  ngOnInit() {
    this.checkedList = this.locationDropdownService.getSelectedLocationList();
  }

  ngAfterViewInit() {}

  onBlur() {
    this.locationDropdownService.lostFocus(
      'Location Dropdown has lost focus!!'
    );
  }

  btnClick() {
    this.showDropDown = !this.showDropDown;
  }

  getSelectedValue(isChecked: Boolean, value: any) {
    this.currentScheduleView =
      this.locationDropdownService.getCurrentScheduleView();

    if (isChecked) {
      this.checkedList.push(value);
      if (this.currentScheduleView === 'room') {
        this.roomDropdownService.addRoomsForNewlySelectedLocation(
          this.checkedList,
          value.LocationId
        );
      }
      if (this.currentScheduleView === 'provider') {
        this.providerOnScheduleDropdownService.addProvidersForNewlySelectedLocation(
          this.checkedList,
          value.LocationId
        );
      }
    } else {
      this.checkedList = this.checkedList.filter(
        itemInArray => itemInArray.LocationId !== value.LocationId
      );
      if (this.currentScheduleView === 'room') {
        this.roomDropdownService.removeRoomsForDeselectedLocation(
          value.LocationId
        );
      }
      if (this.currentScheduleView === 'provider') {
        this.providerOnScheduleDropdownService.removeProvidersForDeselectedLocation(
          value.LocationId
        );
      }
    }

    this.currentSelected = { checked: isChecked, name: value };

    this.areAllCheckedOrAllUnchecked();
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

  //This is our initialization method.
  //This gets called on loading of scheduler, also when the global location changes, when the view changes between provider and room,
  //or when the column order changes for providers or rooms based on view user is in
  getLocationsForDropdownOnChangeOnInitialization(list) {
    this.masterSelected = false;
    this.checkedList = [];
    this.showDropDown = false;
    this.list = [];

    this.currentScheduleView =
      this.locationDropdownService.getCurrentScheduleView();
    if (this.currentScheduleView === 'room') {
      this.locationDropdownService.initializeUserSettingsForRooms(list);
      this.list = this.locationDropdownService.getDisplayLocationListOnInit();
      this.checkedList =
        this.locationDropdownService.getSelectedLocationListOnInit();
      this.areAllCheckedOrAllUnchecked();
      this.roomDropdownService.addRoomsForInitializingLocation(
        this.locationDropdownService.getSelectedRoomListOnInit(),
        this.locationDropdownService.getDisplayRoomListOnInit()
      );
    }

    if (this.currentScheduleView === 'provider') {
      this.locationDropdownService.initializeUserSettingsForProviders(list);
      this.list = this.locationDropdownService.getDisplayLocationListOnInit();
      this.checkedList =
        this.locationDropdownService.getSelectedLocationListOnInit();
      this.areAllCheckedOrAllUnchecked();
      this.providerOnScheduleDropdownService.addProvidersForInitializingLocation(
        this.locationDropdownService.getSelectedProviderListOnInit(),
        this.locationDropdownService.getDisplayProviderListOnInit()
      );
    }
  }

  //This gets called when the Select All checkbox is checked
  selectOrDeselectAllValues(event) {
    this.currentScheduleView =
      this.locationDropdownService.getCurrentScheduleView();
    this.checkedList = [];
    if (event.target.checked) {
      for (var i = 0; i < this.list.length; i++) {
        this.list[i].checked = true;
        this.checkedList.push(this.list[i]);
      }
      if (this.currentScheduleView === 'room') {
        this.roomDropdownService.addAllRoomsForAllLocations(this.checkedList);
      }
      if (this.currentScheduleView === 'provider') {
        this.providerOnScheduleDropdownService.addAllProvidersForAllLocations(
          this.checkedList
        );
      }
    } else {
      this.list.forEach(function (value) {
        value.checked = false;
      });
      if (this.currentScheduleView === 'room') {
        this.roomDropdownService.removeAllRoomsForAllLocations();
      }
      if (this.currentScheduleView === 'provider') {
        this.providerOnScheduleDropdownService.removeAllProvidersForAllLocations();
      }
    }
  }

  shareCheckedlist() {
    this.shareCheckedList.emit(this.checkedList);
  }

  async ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      //If the global location changes, this will get the user settings for locations and rooms or it is will set the default settings for locations and rooms
      if (
        property === 'globalSelectedLocation' &&
        changes.list &&
        changes.list.currentValue.length > 0 &&
        changes.globalSelectedLocation.currentValue.length > 0
      ) {
        //Remove the checked property from the list
        changes.list.currentValue.forEach(function (list) {
          delete list.checked;
        });
        this.getLocationsForDropdownOnChangeOnInitialization(
          changes.list.currentValue
        );
      }
      //If the view is changed to room view or provider view, this will get the user settings for locations and rooms or it is will set the default settings for locations and rooms
      //This is fired during loading of scheduler or toggling between the room and provider buttons on the scheduler
      if (
        property === 'currentScheduleView' &&
        changes.list &&
        changes.list.currentValue.length > 0
      ) {
        this.locationDropdownService.setCurrentScheduleView(
          changes.currentScheduleView.currentValue
        ); //set the view to room or provider view
        //Remove the checked property from the list
        changes.list.currentValue.forEach(function (list) {
          delete list.checked;
        });
        if (this.currentScheduleView === 'provider') {
          changes.list.currentValue.forEach(function (list) {
            delete list.Providers;
          });
          await this.getProvidersForLocations(changes.list.currentValue);
        }
        this.getLocationsForDropdownOnChangeOnInitialization(
          changes.list.currentValue
        );
      }
    }
  }

  async getProvidersForLocations(list) {
    await this.providerOnScheduleDropdownService.getProvidersForLocations(list);
  }

  ngOnDestroy() {
    if (this.shareCheckedList) {
      this.shareCheckedList.unsubscribe();
    }

    if (this.windowClickListenerFn) {
      this.windowClickListenerFn();
    }
  }
}
