import {
  Component,
  OnInit,
  Input,
  Inject,
  Output,
  EventEmitter,
  OnChanges,
  ViewEncapsulation,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { isNullOrUndefined, isUndefined } from 'util';
import { Patient } from '../../../patient/common/models/patient.model';
import cloneDeep from 'lodash/cloneDeep';
import { setTime } from '@progress/kendo-angular-dateinputs/dist/es2015/util';
import { GetProvidersInPreferredOrderFilter } from '../../filters';
import { TranslateService } from '@ngx-translate/core';
import { GroupResult, groupBy } from '@progress/kendo-data-query';
import { AppointmentServiceProcessingRulesService } from 'src/scheduling/common/providers/appointment-service-processing-rules.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
declare var angular: any;

@Component({
  selector: 'provider-selector-with-grouping',
  templateUrl: './provider-selector-with-grouping.component.html',
  styleUrls: ['./provider-selector-with-grouping.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProviderSelectorWithGroupingComponent),
      multi: true
    }
  ]
})
export class ProviderSelectorWithGroupingComponent
  implements OnInit, OnChanges, ControlValueAccessor {
  @Input() activeProvidersOnly: Boolean = false;
  @Input() defaultItemText?: string;
  @Input() filterShowOnSchedule: boolean = true;
  @Input() filterShowOnScheduleForMassUpdate: boolean = true;
  @Input() filterByLocationId: any;
  @Input() patientInfo: any;
  @Input() isOnPatientOverview: boolean = false;
  @Input() filterInactiveProviders: boolean = false;
  @Input() providerTypeIds: number[];
  @Input() optionsForExaminingDentist: any;
  @Input() selectedProvider: string;
  @Input() setPreferred: boolean;
  @Input() isDisabled: boolean;
  @Input() usuallyPerformedBy: number;
  @Output() selectedProviderChange = new EventEmitter();
  @Output() providerChanged = new EventEmitter();
  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  @Input() useGrouping?: boolean = false;
  @Input() appointmentProviders?: [];
  @Input() inwardProvidersList?: [];
  @Input() inputId?: string;
  @Input() className?: string;
  @Input() isRequired?: boolean = false;
  @Input() selectedProviderList: any = [];
  @Input() isMultiSelect: boolean = false;
  @Input() forComponent: string = '';
  @Input() showSelectAll: boolean = true;
  @Input() showInactiveProviders = true;
  @Input() addNoProvider = false;
  @Input() mainDivClassName = 'providerSelector';
  totalActiveProviders = 0;
  totalInactiveProviders = 0;

  allProvidersList: any[] = [];
  public providers: GroupResult[];
  currentLocation: any;
  exceptionProviderId: string;
  showOnSchedulePromise: any = null;
  showOnScheduleExceptions: any = null;
  defaultItem: any;
  initialized: boolean = false;
  isFirstLoad = true;
  public emptyGuId = '00000000-0000-0000-0000-000000000000';
  objNoProvider = {
    Name: 'No Provider',
    Type: 'NoProvider',
    StatusText: 'NA',
    status: 'NA',
    UserId: this.emptyGuId,
    IsActive: true,
    ProviderId: this.emptyGuId,
  };

  unfilteredProviders: any[] = [];
  @ViewChild('providersGroupingDropDown', { static: false })
  public providersGroupingDropDown: any;
  onChange: any;
  onTouched: any;
  constructor(
    private translate: TranslateService,
    @Inject('locationService') private locationService,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('localize') private localize,
    @Inject('PatientLandingFactory') private patientLandingfactory,
    @Inject('ProviderShowOnScheduleFactory') private showOnScheduleFactory,
    @Inject('ListHelper') private listHelper,
    private appointmentServiceProcessingRulesService: AppointmentServiceProcessingRulesService
  ) { }
  styleInfo(dataItem) {
    if (dataItem) {
      return {
        color: dataItem.IsActive ? 'black' : 'black',
        'font-style': dataItem.IsActive ? 'normal' : 'normal',
        'font-weight': dataItem.IsPreferred ? 'bold' : 'normal',
        display: 'block',
        width: '100%',
      };
    } else {
      return {
        color: 'black',
        'font-weight': 'normal',
        'font-style': 'normal',
        display: 'block',
        width: '100%',
      };
    }
  }
  styleInfoMultiSelect(dataItem) {
    if (dataItem) {
      return {
        color: dataItem.IsActive ? 'black' : 'black',
        'font-style': dataItem.IsActive ? 'normal' : 'normal',
        'font-weight': dataItem.IsPreferred ? 'bold' : 'normal',
        float: 'right',
        'margin-top': '-1px',
        'margin-left': '-5px',
      };
    }
  }

  ngOnInit() {
    if (this.inwardProvidersList) {
      if (
        this.forComponent == 'appointmentwidget' ||
        this.forComponent == 'appointments'
      ) {
        this.groupandSetProviders(this.inwardProvidersList);
      }
    } else {
      if (this.appointmentProviders) {
        let allProvidersList = this.referenceDataService.get(
          this.referenceDataService.entityNames.users
        );
        this.appointmentServiceProcessingRulesService.formatProviderPropertiesForServices(
          allProvidersList
        );
        let filteredProviderList = this.appointmentServiceProcessingRulesService.filterProvidersForServicesWithAppointments(
          allProvidersList,
          this.appointmentProviders
        );

        filteredProviderList = filteredProviderList.sort(
          (providerA: any, providerB: any) => {
            if (providerA.IsActive !== providerB.IsActive) {
              return providerA.IsActive === true ? -1 : 1;
            }
          }
        );
        this.groupandSetProviders(filteredProviderList);
      } else this.loadProvidersByLocation();
    }

    let defaultText = this.defaultItemText
      ? this.translate.instant(this.defaultItemText)
      : this.translate.instant('- Select Provider -');
    this.defaultItem = { Name: defaultText, ProviderId: null };
    this.initialized = true;

    if (this.isMultiSelect) {
      if (this.selectedProviderList && this.selectedProviderList.length == 0)
        this.selectedProviderList.push({ Name: '', ProviderId: '' });
      else {
        this.setProvidersfromDefaultList();
      }
    }
  }

  ngOnChanges(changes: any) {
    if (
      changes.patientInfo &&
      !changes.patientInfo.firstChange &&
      changes.patientInfo.currentValue
    ) {
      this.filterProviders();
    } else if (
      (changes.filterByLocationId || changes.isDisabled) &&
      this.initialized
    ) {
      this.selectedProvider = null;
      this.filterProviders();
    } else if (
      changes.providerTypeIds &&
      !changes.providerTypeIds.firstChange
    ) {
      this.selectedProvider = null;
      this.filterProviders();
    }
  }

  onProviderChanged(selectedProviderId) {
    if (!this.isMultiSelect) {
      if (this.providerChanged) {
        if (selectedProviderId != this.emptyGuId) {
          var selectedProviderInfo = this.allProvidersList.find(provider => {
            return provider.UserId === selectedProviderId;
          });
          var element = document.getElementsByClassName('k-dropdown-wrap')[0];
          if (
            this.isRequired &&
            (!this.selectedProvider || this.selectedProvider == '')
          ) {
            element['style'].border = '1px solid red';
          } else element['style'].border = '';
          this.selectedProviderChange.emit(this.selectedProvider);
          this.providerChanged.emit(
            this.createEmitItem(
              selectedProviderInfo,
              selectedProviderInfo.IsActive ? 'Active' : 'Inactive'
            )
          );
        } else {
          this.selectedProviderChange.emit(this.emptyGuId);
          this.providerChanged.emit(
            this.createEmitItem(angular.copy(this.objNoProvider), 'Inactive')
          );
        }
      }
    } else {
      var element = document.getElementsByClassName('k-multiselect-wrap')[0];
      if (
        this.isRequired &&
        (!this.selectedProviderList || this.selectedProviderList.length == 0)
      ) {
        element['style'].border = '1px solid red';
      } else element['style'].border = '';
      this.selectedProviderChange.emit(this.selectedItems);
    }
  }
  // loads and filters the provider list by either a passed location id or currentLocation.id
  loadProvidersByLocation() {
    if (this.filterShowOnSchedule === true) {
      this.showOnSchedulePromise = this.showOnScheduleFactory
        .getAll()
        .then(res => {
          this.showOnScheduleExceptions = res.Value;
        });
    }

    this.allProvidersList = [];
    this.providers = [];
    this.currentLocation = this.locationService.getCurrentLocation();
    this.allProvidersList = this.referenceDataService.get(
      this.referenceDataService.entityNames.users
    );

    this.addDynamicColumnsToProviders(this.allProvidersList);

    this.filterProviders();
  }

  addDynamicColumnsToProviders(providersList: any[]) {
    if (providersList) {
      providersList.forEach(provider => {
        // dynamic values for list (if not set by getProvidersInPreferredOrderFilter)
        provider.Name =
          provider.FirstName +
          ' ' +
          provider.LastName +
          (provider.ProfessionalDesignation
            ? ', ' + provider.ProfessionalDesignation
            : '');
        provider.FullName = provider.FirstName + ' ' + provider.LastName;
        provider.ProviderId =
          provider.ProviderId > '' ? provider.ProviderId : provider.UserId;
      });
    }
  }

  filterProviders() {
    // if location id is passed to directive, use that else use the current location id
    var filterByLocationId = isNullOrUndefined(this.filterByLocationId)
      ? this.currentLocation.id
      : this.filterByLocationId;
    var filteredProviderList = this.filterProviderList(
      this.allProvidersList,
      filterByLocationId
    );
    // ordering
    let providers = [];
    if (filteredProviderList && this.patientInfo) {
      providers = filteredProviderList;
    } else {
      // if sorting is not handled by that getProvidersInPreferredOrderFilter sort by Active, LastName
      providers = filteredProviderList.sort(
        (providerA: any, providerB: any) => {
          if (providerA.IsActive !== providerB.IsActive) {
            return providerA.IsActive === true ? -1 : 1;
          }
          return providerA.LastName.localeCompare(providerB.LastName);
        }
      );
    }

    let ProvidersTemp = [];
    // only if we are filtering out inactive providers
    if (this.filterInactiveProviders === true) {
      // filter out all inactive providers
      // exception: if the currently selected provider is inactive, keep that provider in the list

      // custom handling for the patient overview screen. yuck.
      if (this.isOnPatientOverview === true) {
        ProvidersTemp = providers.filter(
          provider => provider.IsActive === true
        );
      } else {
        // every place except the patient overview screen
        ProvidersTemp = providers.filter(
          provider =>
            provider.IsActive === true ||
            this.selectedProvider === provider.ProviderId
        );
      }
    } else {
      ProvidersTemp = Object.assign([], providers);
    }

    this.groupandSetProviders(ProvidersTemp);

    // only if we're filtering for show on schedule
    if (
      this.filterShowOnSchedule === true &&
      !isNullOrUndefined(this.showOnSchedulePromise)
    ) {
      this.showOnSchedulePromise.then(this.providers);
    }
  }
  groupandSetProviders(ProvidersTemp) {
    this.unfilteredProviders = [];
    for (const prvdr of ProvidersTemp) {
      prvdr.StatusText = prvdr.IsActive
        ? 'Active Providers'
        : 'Inactive Providers';
      this.unfilteredProviders.push(angular.copy(prvdr));
    }

    if (this.addNoProvider && ProvidersTemp && ProvidersTemp.length > 0) {
      ProvidersTemp.push(angular.copy(this.objNoProvider));
      this.unfilteredProviders.push(angular.copy(this.objNoProvider));
    }
    this.providers = groupBy(ProvidersTemp, [{ field: 'StatusText' }]);
  }

  filterProviderList(allProvidersList, filterByLocationId) {
    filterByLocationId = parseInt(filterByLocationId);
    var filteredProviderList = [];
    // if filterByLocation is passed to directive, filter by this location
    filteredProviderList = this.filterProvidersByUserLocations(
      allProvidersList,
      filterByLocationId
    );

    // filter list for onlyActive
    filteredProviderList = this.filterProviderListForOnlyActive(
      filteredProviderList
    );

    // add preferredProviders to list
    filteredProviderList = this.setPreferredProviders(
      filteredProviderList,
      filterByLocationId
    );

    // set selected provider if needed
    this.defaultSelectedProvider(filteredProviderList);

    // filter by providerType
    filteredProviderList = this.filterByProviderType(filteredProviderList);
    // check for exceptionProvider
    this.addExceptionProvider(filteredProviderList);

    // add options  for examining dentists
    this.addOptionsForExaminingDentist(filteredProviderList);

    //add list for only show on schedule
    filteredProviderList = this.filterProviderListForOnlyShowOnSchedule(
      filteredProviderList,
      filterByLocationId
    );

    return filteredProviderList;
  }

  //// modify providerDropdownTemplate to show inactive users in grey italics
  //$scope.providerDropdownTemplate =
  //    '<div id="providerDropdownTemplate" type="text/x-kendo-template">' +
  //    '<span id="lblSelectedName" class="value-template-input k-state-default" ' +
  //    'ng-style="{\'color\': dataItem.IsActive ? \'black\' : \'lightgrey\', \'font-style\': dataItem.IsActive ? \'normal\' : \'italic\',\'font-weight\': dataItem.IsPreferred ? \'bold\' : \'normal\',\'display\': \'block\',\'width\': \'100%\' }">#: Name #</span>' +
  //    '</div>';

  filterByProviderType(providerList) {
    var filteredProviderList = [];
    if (this.providerTypeIds) {
      providerList.forEach(provider => {
        var index = this.providerTypeIds.indexOf(
          provider.UserLocationSetup.ProviderTypeId
        );
        if (index !== -1) {
          filteredProviderList.push(provider);
        }
      });
    } else {
      filteredProviderList = providerList;
    }
    return filteredProviderList;
  }

  // filter the provider list by selected location id and only include userLocationSetup data for that location
  filterProvidersByUserLocations(providerList, filterByLocationId) {
    var filteredProviderList = [];
    if (providerList) {
      providerList.forEach(provider => {
        var userLocationSetup = !isNullOrUndefined(provider.Locations)
          ? provider.Locations.find(userLocationSetup => {
            return userLocationSetup.LocationId === filterByLocationId;
          })
          : null;
        if (userLocationSetup) {
          // NOTE
          // provider.IsActive is based on the UserLocationSetup.IsActive instead of the user.IsActive
          // provider.IsActive = false currently only shows the provider in  italicized grey text and at the
          // bottom of provider list when list is based on a location
          provider.IsActive = userLocationSetup.IsActive;
          provider.UserLocationSetup = cloneDeep(userLocationSetup);
          filteredProviderList.push(provider);
        }
      });
    }
    return filteredProviderList;
  }

  // add options for the examining dentist
  addOptionsForExaminingDentist(providerList) {
    if (!isUndefined(this.optionsForExaminingDentist)) {
      var option = {
        Name: this.localize.getLocalizedString('No Exam Needed'),
        ProviderId: 'noexam',
        IsActive: true,
      };
      providerList.unshift(option);
      option = {
        Name: this.localize.getLocalizedString('Any Dentist'),
        ProviderId: 'any',
        IsActive: true,
      };
      providerList.unshift(option);
    }
  }

  // if exceptionProviderId is passed to directive, add to list if not there
  addExceptionProvider(providerList) {
    if (!isNullOrUndefined(this.exceptionProviderId)) {
      // if exceptionProviderId is not in providerList, add it
      var providerInList = providerList.find(provider => {
        return provider.UserId === this.exceptionProviderId;
      });
      if (!providerInList) {
        var provider = this.allProvidersList.find(provider => {
          return provider.UserId === this.exceptionProviderId;
        });
        if (provider) {
          providerList.push(provider);
        }
      }
    }
    return providerList;
  }

  // set list of providers with preferred providers set to IsPreferred based on patientInfo
  setPreferredProviders(providerList, filterByLocationId) {
    var preferredProviderList = [];
    preferredProviderList = providerList.sort(
      (providerA: any, providerB: any) => {
        if (providerA.IsActive !== providerB.IsActive) {
          return providerA.IsActive === true ? -1 : 1;
        }
        return providerA.LastName.localeCompare(providerB.LastName);
      }
    );
    if (providerList && this.patientInfo) {
      const filter = new GetProvidersInPreferredOrderFilter(this.listHelper);
      preferredProviderList = filter.transform(
        preferredProviderList,
        cloneDeep(this.patientInfo),
        filterByLocationId
      );
    }
    providerList = preferredProviderList;
    return preferredProviderList;
  }

  // filter based on onlyActive property
  filterProviderListForOnlyActive(providerList) {
    // if selectedProvider is not in list, add it to filtered list for display (may have been deactivated after service transaction created)
    return this.activeProvidersOnly === true
      ? providerList.filter(provider => {
        return (
          provider.IsActive === true ||
          (!isNullOrUndefined(this.selectedProvider) &&
            provider.UserId === this.selectedProvider)
        );
      })
      : providerList;
  }

  filterProviderListForOnlyShowOnSchedule(providerList, filterByLocationId) {
    if (
      this.filterShowOnScheduleForMassUpdate === true &&
      this.showOnScheduleExceptions
    ) {
      let filteredData = this.showOnScheduleExceptions
        .filter(
          x => x.ShowOnSchedule == false && x.LocationId == filterByLocationId
        )
        .map(m => m.UserId);
      providerList = providerList.filter(x => {
        return x.IsActive === true && !filteredData.includes(x.UserId);
      });
    }
    return providerList;
  }

  // filter based on showOnSchedule
  filterProviderListForShowOnSchedule(providerList, filterByLocationId) {
    if (this.filterShowOnSchedule !== true) {
      return providerList;
    }

    // filter exceptions down to filterByLocationId
    var exceptions = this.showOnScheduleExceptions.filter(exception => {
      return exception.LocationId === filterByLocationId;
    });

    return providerList.filter(provider => {
      // if provider type 1 or 2, initially true, else false
      var show =
        provider.UserLocationSetup.ProviderTypeId === 1 ||
        provider.UserLocationSetup.ProviderTypeId === 2;

      // if exception exists, override
      var exception = exceptions.filter(exception => {
        return exception.UserId === provider.UserId;
      });
      if (!isNullOrUndefined(exception) && exception.length > 0) {
        show = exception[0].ShowOnSchedule;
      }

      return show;
    });
  }

  // Handle different patient objects passed to selector
  getPatientPreferredDentist(patientInfo) {
    if (patientInfo.Profile) {
      return patientInfo.Profile.PreferredDentist;
    }
    if (patientInfo.PreferredDentist) {
      return patientInfo.PreferredDentist;
    }
    return null;
  }

  getPatientPreferredHygienist(patientInfo) {
    if (patientInfo.Profile) {
      return patientInfo.Profile.PreferredHygienist;
    }
    if (patientInfo.PreferredHygienist) {
      return patientInfo.PreferredHygienist;
    }
    return null;
  }

  // this method only sets the selected provider if the selected provider is null or undefined or empty
  // and setPreferred is true
  //
  defaultSelectedProvider(filteredProviderList) {
    if (
      (!this.selectedProvider || this.selectedProvider === '') &&
      this.setPreferred === true &&
      this.patientInfo
    ) {
      // patientInfo may have different objects
      var patientPreferredDentist = this.getPatientPreferredDentist(
        this.patientInfo
      );
      var patientPreferredHygenist = this.getPatientPreferredHygienist(
        this.patientInfo
      );
      this.selectedProvider = '';
      setTimeout(() => {
        filteredProviderList.forEach(provider => {
          if (!this.isMultiSelect) {
            if (
              provider.IsPreferred &&
              this.usuallyPerformedBy === 1 &&
              provider.UserLocationSetup.ProviderTypeId !== 4 &&
              provider.ProviderId === patientPreferredDentist
            ) {
              this.selectedProvider = provider.ProviderId;
              this.patientLandingfactory.setPreferredProvider(
                provider.ProviderId
              );
              this.onProviderChanged(this.selectedProvider);
            }
            if (
              provider.IsPreferred &&
              this.usuallyPerformedBy === 2 &&
              provider.UserLocationSetup.ProviderTypeId !== 4 &&
              provider.ProviderId === patientPreferredHygenist
            ) {
              this.selectedProvider = provider.ProviderId;
              this.patientLandingfactory.setPreferredProvider(
                provider.ProviderId
              );
              this.onProviderChanged(this.selectedProvider);
            }
          } else {
            if (
              provider.IsPreferred &&
              this.usuallyPerformedBy === 1 &&
              provider.UserLocationSetup.ProviderTypeId !== 4 &&
              provider.ProviderId === patientPreferredDentist
            ) {
              this.selectedProviderList.push(provider);
              this.patientLandingfactory.setPreferredProvider(
                provider.ProviderId
              );
              this.onProviderChanged(this.selectedProvider);
            }
            if (
              provider.IsPreferred &&
              this.usuallyPerformedBy === 2 &&
              provider.UserLocationSetup.ProviderTypeId !== 4 &&
              provider.ProviderId === patientPreferredHygenist
            ) {
              this.selectedProviderList.push(provider);
              this.patientLandingfactory.setPreferredProvider(
                provider.ProviderId
              );
              this.onProviderChanged(this.selectedProvider);
            }
          }
        });
      }, 0);
    }
  }

  public isItemSelected(itm: any): boolean {
    return this.selectedItems.some(item => item.id === itm.ProviderId);
  }

  selectedItems: any = [];
  isActiveChecked = false;
  isInActiveChecked = false;

  onSelectAll(groupName) {
    if (this.showSelectAll) {
      if (groupName == 'Active Providers') {
        this.removeItems('Active');
        this.isActiveChecked = !this.isActiveChecked;
        if (this.isActiveChecked) {
          for (const item of this.providers[0].items) {
            this.selectedItems.push(this.createEmitItem(item, 'Active'));
          }
        }
      } else {
        this.removeItems('Inactive');
        this.isInActiveChecked = !this.isInActiveChecked;
        if (this.isInActiveChecked) {
          for (const item of this.providers[1].items) {
            this.selectedItems.push(this.createEmitItem(item, 'Inactive'));
          }
        }
      }
      this.selectedProviderChange.emit(this.selectedItems);
      if (this.selectedItems.length == 0)
        this.selectedProviderList.push({ Name: '', ProviderId: '' });
    }
  }
  createEmitItem(item, status) {
    var tempItem = angular.copy(item);
    tempItem.id = item['ProviderId'];
    tempItem.status = status;
    tempItem.Selected = true;
    return tempItem;
  }
  removeItems(status) {
    var index = this.selectedItems.findIndex(itm => itm.status === status);
    while (index >= 0) {
      this.selectedItems.splice(index, 1);
      index = this.selectedItems.findIndex(itm => itm.status === status);
    }
  }

  itemClick(dataItem) {
    var index = this.selectedItems.findIndex(
      itm => itm.id === dataItem.ProviderId
    );
    if (index >= 0) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(
        this.createEmitItem(dataItem, dataItem.IsActive ? 'Active' : 'Inactive')
      );
    }
    this.isInActiveChecked =
      this.selectedItems.filter(provider => provider.status === 'Inactive')
        .length == this.totalInactiveProviders;
    this.isActiveChecked =
      this.selectedItems.filter(provider => provider.status === 'Active')
        .length == this.totalActiveProviders;
    if (this.selectedItems.length == 0)
      this.selectedProviderList.push({ Name: '', ProviderId: '' });
  }
  removeTag($event) {
    $event.preventDefault();
  }
  setProvidersfromDefaultList() {
    for (const prvdr of this.selectedProviderList) {
      this.selectedItems.push(this.createEmitItem(prvdr, prvdr['Status']));
    }

    this.totalActiveProviders = this.providers[0]
      ? this.providers[0].items.length
      : 0;
    this.totalInactiveProviders = this.providers[1]
      ? this.providers[1].items.length
      : 0;

    this.isActiveChecked = this.providers[0]
      ? this.selectedItems.filter(provider => provider.status === 'Active')
        .length == this.providers[0].items.length
      : false;
    this.isInActiveChecked = this.providers[1]
      ? this.selectedItems.filter(provider => provider.status === 'Inactive')
        .length == this.providers[1].items.length
      : false;
  }
  selectedProvidersText() {
    if (
      this.selectedItems.length ==
      this.totalActiveProviders + this.totalInactiveProviders
    )
      return 'All Providers';
    else if (
      this.selectedItems.filter(provider => provider.status === 'Active')
        .length == this.totalActiveProviders &&
      this.selectedItems.filter(provider => provider.status === 'Inactive')
        .length == 0
    )
      return 'All Active Providers';
    else if (
      this.selectedItems.filter(provider => provider.status === 'Inactive')
        .length == this.totalInactiveProviders &&
      this.selectedItems.filter(provider => provider.status === 'Active')
        .length == 0
    )
      return 'All Inactive Providers';
    else return this.selectedItems.length + ' Provider(s)';
  }
  resetInactiveProviders() {
    this.showInactiveProviders = !this.showInactiveProviders;
    if (!this.showInactiveProviders) {
      this.providers = groupBy(
        this.unfilteredProviders.filter(o => o.IsActive === true),
        [{ field: 'StatusText' }]
      );
    } else {
      this.providers = groupBy(this.unfilteredProviders, [
        { field: 'StatusText' },
      ]);
    }
  }
  open() {
    if (!this.addNoProvider && this.isFirstLoad) {
      this.resetInactiveProviders();
      this.isFirstLoad = false;
    }
  }
  opened() {
    //this.providersGroupingDropDown.toggle(false);
    if (
      this.addNoProvider &&
      this.providersGroupingDropDown.itemTemplate.templateRef._projectedViews
    ) {
      var length = this.providersGroupingDropDown.itemTemplate.templateRef
        ._projectedViews.length;
      if (document.getElementsByClassName('k-item')[length - 1] != undefined)
        document.getElementsByClassName('k-item')[length - 1]['style'][
          'display'
        ] = 'none';
    }
  }

  setNoProvider() {
    this.selectedProvider = this.emptyGuId;
    this.providersGroupingDropDown.toggle(false);
    this.onProviderChanged(this.emptyGuId);
  }
  ngAfterViewInit() {
    if (this.addNoProvider) {
      this.resetInactiveProviders();
    }
  }

  writeValue(value: any | number | boolean) {
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  getSelectedProviderText(): string {
    return this.selectedProvider ? this.allProvidersList.find(provider => provider.UserId === this.selectedProvider).Name : '';
  }
}
