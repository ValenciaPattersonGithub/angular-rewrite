import { Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import moment from 'moment';
import { WidgetInitStatus, DashboardWidgetService } from '../../services/dashboard-widget.service';
import { GridsterItem } from 'angular-gridster2';
import { OpenClinicalNotesWidgetModel } from './open-clinical-notes-widget-model';
import { Location } from 'src/business-center/practice-settings/location';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { DashboardWidgetStatus } from '../../services/dashboard-widget';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags/fuse-flag';
import { OpenClinicalNotes } from '../../services/dashboard-widget';
@Component({
  selector: 'open-clinical-notes-widget',
  templateUrl: './open-clinical-notes-widget.component.html',
  styleUrls: ['./open-clinical-notes-widget.component.scss']
})
export class OpenClinicalNotesWidgetComponent implements OnInit {
  @Input() data: GridsterItem;
  @Output() loadingComplete = new EventEmitter<DashboardWidgetStatus>();
  openClinicalNotes: OpenClinicalNotesWidgetModel[] = [];
  userContext = JSON.parse(sessionStorage.getItem('userContext'));
  currentUserId = this.userContext?.Result?.User?.UserId;
  selectedProvider = { ProviderId: this.userContext?.Result?.User?.UserId };
  selectedLocation: Location = { LocationId: 0 };
  locationOptions: Location[] = []
  locationIdsForProviderDropdown: number[] = [];
  loadingStatus: DashboardWidgetStatus;
  subscriptions: Subscription[] = [];
  featureFlagSubscription: Subscription;
  subscription: Subscription;
  launchDarklyStatus = false;

  constructor(
    @Inject('tabLauncher') private tabLauncher,
    @Inject('locationService') private locationService,
    private dashboardWidgetService: DashboardWidgetService,
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    private featureFlagService: FeatureFlagService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.data) {
      const nv = changes?.data?.currentValue;
      const ov = changes?.data?.previousValue;
      if (nv && nv != ov) {
        this.selectedLocation.LocationId = nv?.Locations;
        this.selectedProvider.ProviderId = nv?.userData?.UserId;
        this.getDataFromServer();
      }
    }
  }
  ngOnInit(): void {
    this.loadingStatus = { itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: '' };
    this.currentUserId = this.userContext?.Result?.User?.UserId;
    this.selectedProvider.ProviderId = this.userContext?.Result?.User?.UserId;
    this.selectedLocation.LocationId = this.locationService.getCurrentLocation().id;
    this.getUserLocations();
    this.processInitMode(this.data?.initMode);
  }
  clickedOutside = (locationdropdown: DropDownListComponent) => {
    this.dashboardWidgetService.clickedOutside(locationdropdown)
  }
  processInitMode = (initMode) => {
    if (initMode == WidgetInitStatus.Loaded) {
      this.processData(this.openClinicalNotes);
    }
    else if (initMode == WidgetInitStatus.ToLoad) {
      this.getDataFromServer();
    }
    else if (initMode == WidgetInitStatus.Loading) {
      this.loadingStatus.loading = WidgetInitStatus.Loading;
      this.loadingComplete.emit(this.loadingStatus);
    }
  };
  
  onLocationSelectedChange = (value) => {
    this.selectedLocation.LocationId = value;
    if (this.selectedLocation?.LocationId && this.selectedLocation?.LocationId != 0) {
      this.locationIdsForProviderDropdown = [this.selectedLocation?.LocationId];
    }
    else { // all locations
      const tempLocations = [];
      for (let x = 0; x < this.locationOptions?.length; x++) {
        tempLocations?.push(this.locationOptions[x]?.LocationId)
      }
      this.locationIdsForProviderDropdown = tempLocations;
    }
    this.selectedProvider.ProviderId = this.userContext?.Result?.User?.UserId;
    this.getDataFromServer();
  }

  onSelectionChangedByKey = () => {
  }

  assignedProviderChanged = (assignedProvider) => {
    this.selectedProvider.ProviderId = assignedProvider ? assignedProvider?.ProviderId : this.dashboardWidgetService.emptyGuId;
    this.getDataFromServer();
  };


  processData = (data) => {
    this.loadingStatus.loading = WidgetInitStatus.Loaded;
    this.loadingComplete.emit(this.loadingStatus);
    this.openClinicalNotes = data;
  };

  getUserLocations = () => {
    if (this.locationOptions?.length == 0) {
      const tempLocationList: number[] = [];
      let activeLocations = this.locationService.getActiveLocations();
      this.locationOptions.push({ NameLine1: this.translate.instant('All Locations'), LocationId: 0 });
      if (activeLocations) {
        activeLocations = this.groupLocations(activeLocations);
        for (let x = 0; x < activeLocations?.length; x++) {
          this.locationOptions.push({ NameLine1: activeLocations[x].name, LocationId: activeLocations[x].id });
          tempLocationList.push(activeLocations[x].id)
        }
      }
      this.locationIdsForProviderDropdown = tempLocationList;
    }
  }

  groupLocations = (locs: Location[]) => {
    const resLocs: Location[] = [];
    let pendingInactiveLocs: Location[] = [];
    let inactiveLocs: Location[] = [];

    const dateNow = moment().format('MM/DD/YYYY');
    locs.forEach((obj) => {
      if (obj.DeactivationTimeUtc) {
        const toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
        if (moment(toCheck).isBefore(dateNow) || moment(toCheck).isSame(dateNow)) {
          obj.StateName = OpenClinicalNotes.Inactive;
          obj.SortOrder = 3;
          inactiveLocs.push(obj);
        } else {
          obj.StateName = OpenClinicalNotes.PendingInactive;
          obj.SortOrder = 2;
          pendingInactiveLocs.push(obj);
        }
      } else {
        obj.StateName = OpenClinicalNotes.Active;
        obj.SortOrder = 1;
        resLocs.push(obj);
      }
    });
    resLocs.sort((a, b) => (a.NameLine1 < b.NameLine1 ? -1 : 1));
    pendingInactiveLocs = pendingInactiveLocs.sort((a, b) => (a.DeactivationTimeUtc < b.DeactivationTimeUtc ? -1 : 1));
    inactiveLocs = inactiveLocs.sort((a, b) => (a.DeactivationTimeUtc < b.DeactivationTimeUtc ? 1 : -1));

    pendingInactiveLocs.forEach((obj) => {
      resLocs.push(obj);
    });

    inactiveLocs.forEach((obj) => {
      resLocs.push(obj);
    });
    return resLocs;
  }

  getLocationsForFilter = () => {
    //Used to return list of locations to filter,
    //returns 1 location unless All Locations is selected
    //If All Locations is selected, return all locations the user has access to
    const locationLists: number[] = [];
    if (this.selectedLocation.LocationId != 0) {
      locationLists.push(this.selectedLocation?.LocationId);
    }
    else {
      for (let x = 0; x < this.locationOptions?.length; x++) {
        locationLists.push(this.locationOptions[x]?.LocationId);
      }
    }
    return locationLists;
  }

  getDataFromServer = () => {
    const locationFilters = this.getLocationsForFilter();
    const filterProviderId = this.selectedProvider?.ProviderId ? this.selectedProvider.ProviderId : this.dashboardWidgetService.emptyGuId;
    this.featureFlagSubscription = this.featureFlagService.getOnce$(FuseFlag.DashboardClinicalNotesWidgetMvp).subscribe((value) => {
      this.launchDarklyStatus = value;
    });
    this.subscriptions?.push(this.featureFlagSubscription);
    const filters = {
      LocationIds: locationFilters,
      ProviderIds: [filterProviderId],
      LaunchDarklyStatus: this.launchDarklyStatus
    }
    this.loadingStatus = { itemId: this.data?.ItemId, loading: WidgetInitStatus.Loaded, errorMessage: '' };
    this.loadingStatus.loading = WidgetInitStatus.ToLoad;
    this.loadingComplete.emit(this.loadingStatus);
    this.subscription = this.dashboardWidgetService.getWidgetData(OpenClinicalNotes.OpenClinicalNotesUrl, filters)
      .subscribe((res: SoarResponse<OpenClinicalNotesWidgetModel[]>) => {
        this.loadingStatus.loading = WidgetInitStatus.Loaded;
        this.loadingComplete.emit(this.loadingStatus);
        this.processData(res?.Value);
      },
        () => {
          this.loadingStatus.loading = WidgetInitStatus.error;
          this.loadingComplete.emit(this.loadingStatus);
          this.toastrFactory.error(this.translate.instant('WidgetLoadingError'), this.translate.instant('Failed to load data.'));
        }
      );
      this.subscriptions?.push(this.subscription);
  };

  openPatientTab = (patientId) => {
    const params = `tab=1&activeSubTab=3&currentPatientId=${encodeURIComponent(patientId)}`;
    this.tabLauncher.launchNewTab(`#/Patient/${encodeURIComponent(patientId)}/Clinical/?${params}`);
  };

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription?.unsubscribe());    
  }
}






