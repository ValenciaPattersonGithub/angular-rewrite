import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { LocationIdentifierService } from 'src/@shared/providers/location-identifier.service';
import { Location } from 'src/business-center/practice-settings/location';
import { LocationDataService } from '../service/location-data.service';

@Component({
    selector: 'location-landing',
    templateUrl: './location-landing.component.html',
    styleUrls: ['./location-landing.component.scss']
})
export class LocationLandingComponent implements OnInit {
    selectedLocation: Location;
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    isAdding = false;
    isEditing = false;
    locations: Location[] = [];
    saveLocation;
    editLocation;
    addLocation;
    cancelAddEdit;
    loadingLocations = true;
    dataForCrudOperation: { DataHasChanged: false };
    hasAdditionalIdentifierAccess = false;
    selectedLocationId: number;
    loading: boolean;

    constructor(@Inject('localize') private localize,
        @Inject('LocationServices') private locationServices,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('$routeParams') routeParams,
        private locationData: LocationDataService,
        private locationIdentifierService: LocationIdentifierService) {
        this.selectedLocationId = routeParams.locationId;
        this.dataForCrudOperation = { DataHasChanged: false };
    }

    ngOnInit(): void {
        this.getPageNavigation();
        this.getLocations();
        this.authAccess();
        if (this.selectedLocationId?.toString() == '-1') {
            this.isAdding = true;
        }
    }

    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('All Locations'),
                path: '/BusinessCenter/PracticeSettings/Locations/',
                title: 'All Locations'
            }
        ];

    }

    authAdditionalIdentifierAccess = () => {
        this.hasAdditionalIdentifierAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-view');
    }

    authAccess = () => {
        this.authAdditionalIdentifierAccess();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedLocation) {
            const nv = changes?.selectedLocation?.currentValue;            

            if (nv) {
                /** do nothing */
            } else {
                this.isAdding = true;
                this.selectedLocation = {};
            }
        }

    }

    //#region Get Locations from Service
    getLocations = () => {
        this.locationServices?.get()?.$promise?.then((res) => {
            this.locationsGetSuccess(res);
        }, () => {
            this.locationsGetFailure();
        });
    }

    locationsGetSuccess = (res) => {
        this.loadingLocations = false;
        this.locations = this.orderBy(res?.Value, 'NameLine1', 1, 'NameLine2');
        const locIndex = this.locations?.findIndex((location) => location?.LocationId == this.selectedLocationId);
        const selectedLocation = this.locations?.filter((location) => location?.LocationId == this.selectedLocationId)[0];
        if (selectedLocation) {
            this.selectedLocation = selectedLocation;
        }
        if (locIndex > -1) {
            this.locations[locIndex] = this.selectedLocation;
        }        
    }

    locationsGetFailure = () => {
        this.loadingLocations = false;
        this.toastrFactory.error(this.localize.getLocalizedString('{0} {1}', ['Locations', 'failed to load.']), this.localize.getLocalizedString('Server Error'));
    }
    //#endregion

    orderBy = (list: Location[], field: string, direction: number, secondaryField: string) => {
        return list.sort((first, second) => {
            const a = typeof (first[field]) === 'string' ? first[field]?.toLowerCase() : first[field];
            const b = typeof (first[field]) === 'string' ? second[field]?.toLowerCase() : second[field];
            if (a > b) return 1 * direction;
            if (a < b) return -1 * direction;
            const a2 = first[secondaryField]?.toLowerCase();
            const b2 = second[secondaryField]?.toLowerCase();
            if (a2 > b2) return 1;
            if (a2 < b2) return -1;
            return 0;
        });
    }

    onAddBtnClicked = () => {
        document.title = 'Add Location';
        this.locationData?.changeLocationId(-1)
        this.isAdding = true;
        this.addLocation();
        window.location.href = '#/BusinessCenter/PracticeSettings/Locations/' + '?locationId=' + encodeURIComponent(-1);
    }

    getLocationIdentifiers = () => {
        if (this.hasAdditionalIdentifierAccess) {
            this.locationIdentifierService.get()
                .then((res) => {
                    this.locationIdentifiersGetSuccess(res);
                }, () => {
                    this.locationIdentifiersGetFailure();
                });
        } else {
            this.loading = false;
            this.selectedLocation = {};
        }
    }

    locationIdentifiersGetSuccess = (res) => {
        this.loadingLocations = false;
        const result = [];
        for (let i = 0; i < res?.Value?.length; i++) {
            const index = this.selectedLocation?.AdditionalIdentifiers?.findIndex(x => x.MasterLocationIdentifierId == res?.Value[i]?.MasterLocationIdentifierId);
            const value = index !== -1 ? this.selectedLocation?.AdditionalIdentifiers[index]?.Value : undefined;
            result?.push({
                Description: res?.Value[i]?.Description,
                MasterLocationIdentifierId: res?.Value[i]?.MasterLocationIdentifierId,
                Value: value
            });
        }

        this.selectedLocation = {};
        this.selectedLocation.AdditionalIdentifiers = result;
        this.locationData.passLocationIdentifier(result);
    }

    locationIdentifiersGetFailure = () => {
        this.loading = false;
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of additional identifiers. Refresh the page to try again.'), this.localize.getLocalizedString('Error'));
    }

    onEditBtnClicked = () => {
        this.isEditing = true;
        document.title = 'Edit Location';
        this.editLocation();
    }

    onCancelBtnClicked = () => {
        document.title = 'Locations';
        this.cancelAddEdit();
    }

    onCancelConfirm = (overrideAdd) => {
        /** have to override how add is handled so when you cancel out of adding a location it can default to a location */
        if (!overrideAdd) {
            this.isAdding = false;
            this.selectedLocation = !this.selectedLocation?.LocationId ? this.locations?.length > 0 ? this.locations[0] : null : this.selectedLocation;
        }

        this.isEditing = false;
    }

    onSaveBtnClicked = () => {
        this.saveLocation();
    }

    onSaveSuccess = (value) => {
        const ofcLocation = value;

        if (ofcLocation && ofcLocation?.LocationId) {
            const index = this.locations?.findIndex(x => x.LocationId == ofcLocation?.LocationId);

            if (index > -1) {
                this.locations?.splice(index, 1, ofcLocation);
            }
            else {
                this.locations?.push(ofcLocation);
            }
            this.selectedLocation = ofcLocation;
        }
        this.isAdding = false;
        this.isEditing = false;
    }

    resetData = () => {
        this.dataForCrudOperation.DataHasChanged = false;
    }
}