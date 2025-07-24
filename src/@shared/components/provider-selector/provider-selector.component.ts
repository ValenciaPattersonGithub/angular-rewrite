import { Component, OnInit, Input, Inject, Output, EventEmitter, OnChanges } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { GetProvidersInPreferredOrderFilter } from '../../filters';
import { TranslateService } from '@ngx-translate/core'
import { isNullOrUndefined, isUndefined } from 'util';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';


@Component({
    selector: 'provider-selector',
    templateUrl: './provider-selector.component.html',
    styleUrls: ['./provider-selector.component.scss']
})
export class ProviderSelectorComponent implements OnInit, OnChanges {
    @Input() onlyActive: Boolean = false;
    @Input() defaultItemText?: string;
    @Input() filterShowOnSchedule: boolean = true;
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
    @Input() exceptionProviderId?: string = '';
    @Input() sortForClinicalNotes?: boolean = false
    @Input() openClinicalNotes = false;
    allProvidersList: any[] = [];
    providers: any[] = [];
    currentLocation: any;
    showOnSchedulePromise: any = null;
    showOnScheduleExceptions: any = null;
    defaultItem: any;
    initialized: boolean = false;

    constructor(
        private translate: TranslateService,
        @Inject('locationService') private locationService,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('localize') private localize,
        @Inject('PatientLandingFactory') private patientLandingfactory,
        @Inject('ProviderShowOnScheduleFactory') private showOnScheduleFactory,
        @Inject('ListHelper') private listHelper
    ) { }

    ngOnInit() {
        this.loadProvidersByLocation();
        let defaultText = this.defaultItemText ?
            this.translate.instant(this.defaultItemText) :
            this.translate.instant('- Select Provider -');
        this.defaultItem = { Name: defaultText, ProviderId: null };
        this.initialized = true;
    }

    ngOnChanges(changes: any) {
        if (changes.patientInfo && !changes.patientInfo.firstChange && changes.patientInfo.currentValue) {
            this.filterProviders();
        }
        else if ((changes.filterByLocationId || changes.isDisabled) && this.initialized) {
            this.filterProviders();
        }
    }

    onProviderChanged(selectedProviderId) {
        if (this.providerChanged) {
            var selectedProviderInfo = this.allProvidersList?.find((provider) => {
                return provider.UserId === selectedProviderId;
            })
            this.selectedProviderChange.emit(this.selectedProvider);
            this.providerChanged.emit(selectedProviderInfo);
        }
    }
    // loads and filters the provider list by either a passed location id or currentLocation.id
    loadProvidersByLocation() {
        if (this.filterShowOnSchedule === true) {
            this.showOnSchedulePromise = this.showOnScheduleFactory.getAll().then(res => {
                this.showOnScheduleExceptions = res.Value;
            });
        }

        this.allProvidersList = [];
        this.providers = [];
        this.currentLocation = this.locationService.getCurrentLocation();

        this.allProvidersList = this.referenceDataService.get(this.referenceDataService.entityNames.users);

        this.addDynamicColumnsToProviders(this.allProvidersList);

        this.filterProviders();
    };

    addDynamicColumnsToProviders(providersList: any[]) {
        providersList?.forEach(provider => {
            // dynamic values for list (if not set by getProvidersInPreferredOrderFilter)
            if (provider) {
                provider.Name = provider?.FirstName + ' ' + provider?.LastName + (provider?.ProfessionalDesignation ? ', ' + provider?.ProfessionalDesignation : '');
                provider.FullName = provider.FirstName + ' ' + provider.LastName;
                provider.ProviderId = provider?.ProviderId > '' ? provider?.ProviderId : provider?.UserId;
            }
        });
    };
    filterProviders() {
        // if location id is passed to directive, use that else use the current location id
        var filterByLocationId = (this.filterByLocationId == null || this.filterByLocationId == undefined || this.filterByLocationId?.length == 0) ? this.currentLocation.id : this.filterByLocationId;
        var filteredProviderList = this.filterProviderList(this.allProvidersList, filterByLocationId);
        // ordering
        let providers = [];
        if ((filteredProviderList && this.patientInfo) || (this.sortForClinicalNotes)) {
            providers = filteredProviderList;
        } else {
            // if sorting is not handled by that getProvidersInPreferredOrderFilter sort by Active, LastName
            providers = filteredProviderList.sort((providerA: any, providerB: any) => {
                if (providerA.IsActive !== providerB.IsActive) {
                    return providerA.IsActive === true ? -1 : 1;
                }
                return providerA.LastName.localeCompare(providerB.LastName);
            });
        }

        // only if we are filtering out inactive providers
        if (this.filterInactiveProviders === true) {
            // filter out all inactive providers
            // exception: if the currently selected provider is inactive, keep that provider in the list

            // custom handling for the patient overview screen. yuck.
            if (this.isOnPatientOverview === true) {
                this.providers = providers.filter((provider) => provider.IsActive === true);
            } else {
                // every place except the patient overview screen
                this.providers = providers.filter((provider) => provider.IsActive === true || this.selectedProvider === provider.ProviderId);
            }
        } else {
            this.providers = Object.assign([], providers);
        }

        if (this.sortForClinicalNotes) {
            var currentSelectedUser = this.providers.find(x => x.ProviderId === this.selectedProvider);
            if (!currentSelectedUser) {
                this.providerChanged.emit(null);
            }
        }

        // only if we're filtering for show on schedule
        if (this.filterShowOnSchedule === true && (this.showOnSchedulePromise != null)) {
            this.showOnSchedulePromise.then(this.providers);
        }
    };

    sortProviderListForClinicalNotes = (filteredProviderList) => {
        const dentistList = filteredProviderList.filter((provider) =>
            provider?.UserLocationSetup?.some((x) => x?.provider?.ProviderTypeId == 1));

        const otherProvidersList = filteredProviderList.filter((provider) =>
            provider?.UserLocationSetup?.every((x) => x?.provider?.ProviderTypeId != 1));

        dentistList.sort((a, b) => a.LastName.localeCompare(b.LastName));
        otherProvidersList.sort((a, b) => a.LastName.localeCompare(b.LastName));

        filteredProviderList = [];
        filteredProviderList = filteredProviderList.concat(dentistList);
        filteredProviderList = filteredProviderList.concat(otherProvidersList);
        return filteredProviderList
    };

    filterProviderList(allProvidersList, filterByLocationId) {
        if (filterByLocationId instanceof Array) {
            for (var x = 0; x < filterByLocationId?.length; x++) {
                filterByLocationId[x] = parseInt(filterByLocationId[x]);
            }
        }
        let filteredProviderList = [];
        // if filterByLocation is passed to directive, filter by this location
        filteredProviderList = this.filterProvidersByUserLocations(allProvidersList, filterByLocationId);

        // filter list for onlyActive
        filteredProviderList = this.filterProviderListForOnlyActive(filteredProviderList);

        // add preferredProviders to list            
        filteredProviderList = this.setPreferredProviders(filteredProviderList, filterByLocationId);

        // set selected provider if needed 
        this.defaultSelectedProvider(filteredProviderList);

        // filter by providerType
        filteredProviderList = this.filterByProviderType(filteredProviderList);
        // check for exceptionProvider
        this.addExceptionProvider(filteredProviderList);

        // add options  for examining dentists
        this.addOptionsForExaminingDentist(filteredProviderList);

        if (this.sortForClinicalNotes && !this.exceptionProviderId) {
            //When an exceptionProvider is given, that means we shouldn't be sorting at all
            filteredProviderList = this.sortProviderListForClinicalNotes(filteredProviderList)
        }
        return filteredProviderList;

    };

    //// modify providerDropdownTemplate to show inactive users in grey italics
    //$scope.providerDropdownTemplate =
    //    '<div id="providerDropdownTemplate" type="text/x-kendo-template">' +
    //    '<span id="lblSelectedName" class="value-template-input k-state-default" ' +
    //    'ng-style="{\'color\': dataItem.IsActive ? \'black\' : \'lightgrey\', \'font-style\': dataItem.IsActive ? \'normal\' : \'italic\',\'font-weight\': dataItem.IsPreferred ? \'bold\' : \'normal\',\'display\': \'block\',\'width\': \'100%\' }">#: Name #</span>' +
    //    '</div>';
    filterByProviderType(providerList) {
        var filteredProviderList = [];
        if (this.providerTypeIds) {
            providerList?.forEach(provider => {
                if (provider?.UserLocationSetup instanceof Array) {
                    for (var x = 0; x < provider?.UserLocationSetup?.length; x++) {
                        let index = this.providerTypeIds.indexOf(provider?.UserLocationSetup[x]?.ProviderTypeId);
                        if (index !== -1) {
                            filteredProviderList.push(provider);
                            //Stop looping through provider locations once any of the location setups match a provider type in the filter list
                            x = provider.UserLocationSetup.length;
                        }
                    }
                }
                else {
                    let index = this.providerTypeIds.indexOf(provider?.UserLocationSetup?.ProviderTypeId);
                    if (index !== -1) {
                        filteredProviderList.push(provider);
                    }
                }
            });
        } else {
            filteredProviderList = providerList;
        }
        return filteredProviderList;
    };

    // filter the provider list by selected location id and only include userLocationSetup data for that location
    filterProvidersByUserLocations(providerList, filterByLocationId) {
        var filteredProviderList = [];
        providerList?.forEach((provider) => {
            provider.UserLocationSetup = [];
            let userLocationSetup;
            if (filterByLocationId instanceof Array) {
                for (let x = 0; x < filterByLocationId?.length; x++) {
                    userLocationSetup = !isNullOrUndefined(provider.Locations) ? provider.Locations.find((userLocationSetup) => {
                        return userLocationSetup.LocationId == filterByLocationId[x];
                    }) : null;

                    if (userLocationSetup) {
                        // NOTE
                        // provider.IsActive is based on the UserLocationSetup.IsActive instead of the user.IsActive
                        // provider.IsActive = false currently only shows the provider in  italicized grey text and at the
                        // bottom of provider list when list is based on a location 
                        provider.IsActive = userLocationSetup.IsActive;
                        provider.UserLocationSetup.push(cloneDeep(userLocationSetup));
                        if (filteredProviderList.indexOf(provider) === -1) {
                            filteredProviderList.push(provider);
                        }
                    }
                }
            }
            else {
                userLocationSetup = !isNullOrUndefined(provider.Locations) ? provider.Locations.find((userLocationSetup) => {
                    return userLocationSetup.LocationId == filterByLocationId;
                }) : null;
                if (userLocationSetup) {
                    // NOTE
                    // provider.IsActive is based on the UserLocationSetup.IsActive instead of the user.IsActive
                    // provider.IsActive = false currently only shows the provider in  italicized grey text and at the
                    // bottom of provider list when list is based on a location 
                    provider.IsActive = userLocationSetup.IsActive;
                    provider.UserLocationSetup = cloneDeep(userLocationSetup);
                    filteredProviderList.push(provider);
                }
            }
        });
        return filteredProviderList;
    };
    // add options for the examining dentist
    addOptionsForExaminingDentist(providerList) {
        if (!isUndefined(this.optionsForExaminingDentist)) {
            var option = {
                Name: this.localize.getLocalizedString('No Exam Needed'),
                ProviderId: 'noexam',
                IsActive: true
            };
            providerList.unshift(option);
            option = {
                Name: this.localize.getLocalizedString('Any Dentist'),
                ProviderId: 'any',
                IsActive: true
            };
            providerList.unshift(option);
        }
    };

    // if exceptionProviderId is passed to directive, add to list if not there
    addExceptionProvider(providerList) {
        if (!isNullOrUndefined(this.exceptionProviderId)) {
            // if exceptionProviderId is not in providerList, add it
            var providerInList = providerList.find((provider) => {
                return provider.UserId === this.exceptionProviderId || provider.ProviderId === this.exceptionProviderId;
            });
            if (!providerInList) {
                var provider = this.allProvidersList?.find((provider) => {
                    return provider.UserId === this.exceptionProviderId || provider.ProviderId === this.exceptionProviderId;
                });
                if (provider) {
                    providerList.push(provider);
                }
            }
        }
        return providerList;
    };

    // set list of providers with preferred providers set to IsPreferred based on patientInfo
    setPreferredProviders(providerList, filterByLocationId) {
        var preferredProviderList = [];
        if (this.sortForClinicalNotes) {
            preferredProviderList = providerList.sort((providerA: any, providerB: any) => {
                return providerA.LastName.localeCompare(providerB.LastName);
            });
            if (providerList && this.patientInfo) {
                const filter = new GetProvidersInPreferredOrderFilter(this.listHelper);
                preferredProviderList = filter.transform(preferredProviderList, cloneDeep(this.patientInfo), filterByLocationId);
            }
            providerList = preferredProviderList;
        } else {
            providerList?.forEach(provider => {
                if (this.patientInfo && (provider.UserId === this.patientInfo.PreferredDentist)) {
                    provider.IsPreferred = true;
                }
            });
            return providerList;
        }
        return preferredProviderList;
    };

    // filter based on onlyActive property
    filterProviderListForOnlyActive(providerList) {
        // if selectedProvider is not in list, add it to filtered list for display (may have been deactivated after service transaction created)
        return (this.onlyActive === true) ?
            providerList.filter(provider => {
                return provider.IsActive === true || ((this.selectedProvider != null) && (this.selectedProvider != undefined) && provider.UserId === this.selectedProvider);
            }) :
            providerList;
    };

    // filter based on showOnSchedule
    filterProviderListForShowOnSchedule(providerList, filterByLocationId) {
        if (this.filterShowOnSchedule !== true) {
            return providerList;
        }

        // filter exceptions down to filterByLocationId
        var exceptions = this.showOnScheduleExceptions.filter((exception) => { return exception.LocationId === filterByLocationId });

        return providerList.filter((provider) => {
            // if provider type 1 or 2, initially true, else false
            var show = provider.UserLocationSetup.ProviderTypeId === 1 || provider.UserLocationSetup.ProviderTypeId === 2;

            // if exception exists, override
            var exception = exceptions.filter((exception) => { return exception.UserId === provider.UserId });
            if (!isNullOrUndefined(exception) && exception.length > 0) {
                show = exception[0].ShowOnSchedule;
            }

            return show;
        });
    };

    // Handle different patient objects passed to selector
    getPatientPreferredDentist(patientInfo) {
        if (patientInfo.Profile) {
            return patientInfo.Profile.PreferredDentist;
        }
        if (patientInfo.PreferredDentist) {
            return patientInfo.PreferredDentist;
        }
        return null;
    };

    getPatientPreferredHygienist(patientInfo) {
        if (patientInfo.Profile) {
            return patientInfo.Profile.PreferredHygienist;
        }
        if (patientInfo.PreferredHygienist) {
            return patientInfo.PreferredHygienist;
        }
        return null;
    };

    // this method only sets the selected provider if the selected provider is null or undefined or empty
    // and setPreferred is true
    // 
    defaultSelectedProvider(filteredProviderList) {
        if ((this.selectedProvider === '' || this.selectedProvider == null) && this.setPreferred === true && this.patientInfo) {
            // patientInfo may have different objects
            var patientPreferredDentist = this.getPatientPreferredDentist(this.patientInfo);
            var patientPreferredHygenist = this.getPatientPreferredHygienist(this.patientInfo);
            this.selectedProvider = '';
            setTimeout(() => {
                filteredProviderList?.forEach(provider => {
                    if (provider) {
                        if (provider.IsPreferred && this.usuallyPerformedBy === 1 && provider.UserLocationSetup.ProviderTypeId !== 4 && provider.ProviderId === patientPreferredDentist) {
                            this.selectedProvider = provider.ProviderId;
                            this.patientLandingfactory.setPreferredProvider(provider.ProviderId);
                        }
                        if (provider.IsPreferred && this.usuallyPerformedBy === 2 && provider.UserLocationSetup.ProviderTypeId !== 4 && provider.ProviderId === patientPreferredHygenist) {
                            this.selectedProvider = provider.ProviderId;
                            this.patientLandingfactory.setPreferredProvider(provider.ProviderId);
                        }
                    }
                });
            }, 0);
        }
    };

    clickedOutside = (dropdownlist:DropDownListComponent) => {
        if ((dropdownlist as DropDownListComponent)?.isOpen) {
          (dropdownlist as DropDownListComponent)?.toggle(false);
        }
      }
}