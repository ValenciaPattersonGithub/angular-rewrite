import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { LocationChangeService } from 'src/@shared/providers/location-change.service';
import { SoarEraHttpService } from 'src/@core/http-services/soar-era-http.service';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';

@Component({
    selector: 'app-era-landing',
    templateUrl: './era-landing.component.html',
    styleUrls: ['./era-landing.component.scss']
})
export class EraLandingComponent implements OnInit, OnDestroy {
    loggedInLocation = { id: 0, name: '', status: '' };
    insurancePaymentTypes = [];
    initialLoading = true;
    allowedLocations = [];
    selectedLocationIds: number[];
    allLocations = {}; // Used for lookup
    locationEnrolledInEra = false;
    locationChangeListener: any;
    paymentTypeCategories = { Account: 1, Insurance: 2 };
    enableNewEraIngestion = false;

    processedSearchOptions = [
        { Description: 'Not Completed', IsProcessed: false },
        { Description: 'Completed', IsProcessed: true },
        { Description: 'All', IsProcessed: null },
    ];

    filterOption = this.processedSearchOptions[0];
    filteredLocations: number[];

    constructor(
        @Inject('$location') private $location: ng.ILocationService,
        @Inject('toastrFactory') private toastrFactory: any,
        @Inject('patSecurityService') private patSecurityService: any,
        @Inject('AmfaInfo') private amfaInfo: any,
        private locationChangeService: LocationChangeService,
        @Inject('locationService') private locationService: any, //Platform
        @Inject('LocationServices') private locationServices: any, //Fuse
        private eraService: SoarEraHttpService,
        @Inject('referenceDataService') private referenceDataService,
        private paymentTypesService: PaymentTypesService,
        private featureFlagService: FeatureFlagService
    ) { }

    ngOnInit() {
        if (!this.patSecurityService.IsAuthorizedByAbbreviation('soar-acct-aipmt-view')) {
            this.toastrFactory.error(this.patSecurityService.generateMessage('soar-acct-aipmt-view'), 'Not Authorized');
            this.$location.path('/');
            return;
        }

        this.loggedInLocation = this.locationService.getCurrentLocation();
        this.selectedLocationIds = [this.loggedInLocation.id];

        this.featureFlagService.getOnce$(FuseFlag.EnableNewEraIngestion).subscribe((value) => {
            this.enableNewEraIngestion = value;
            this.loadEraRelatedData();
        });

        this.locationChangeListener = this.locationChangeService.subscribe(() => {
            const ofcLocation = this.locationService.getCurrentLocation();
            if (ofcLocation.id != this.loggedInLocation.id) {
                this.loggedInLocation = ofcLocation;
                this.locationServices.getLocationEraEnrollmentStatus({ locationId: this.loggedInLocation.id }).$promise.then((res) => {
                    this.locationEnrolledInEra = res.Result;
                });
            }
        });

    }

    loadEraRelatedData() {
        var updatePromises = [];
        updatePromises.push(this.paymentTypesService.getAllPaymentTypesMinimal(false, this.paymentTypeCategories.Insurance));
        updatePromises.push(this.locationServices.getPermittedLocations({ actionId: this.amfaInfo['soar-ins-iclaim-view'].ActionId }).$promise);
        updatePromises.push(this.locationServices.getLocationEraEnrollmentStatus({ locationId: this.loggedInLocation.id }).$promise);
        updatePromises.push(this.getLocations());
        // Load any new ERAs from ERA service into Fuse, then continue.
        // (No need to do this again when filtering, only the first time in.
        // Ideally refactored later so Fuse consumes directly of course.)
        if (this.enableNewEraIngestion)
            updatePromises.push(this.eraService.loadNewEras().toPromise());

        if (updatePromises?.length > 0) {
            Promise.all(updatePromises).then((res) => {
                if (res) {
                    this.insurancePaymentTypes = res[0]?.Value;
                    this.allowedLocations = res[1]?.Value;
                    this.locationEnrolledInEra = res[2]?.Result;
                    this.allLocations = res[3];

                    this.initialLoading = false;
                }
            });
        }
    }

    getLocations = async () => {
        const locations: any[] = await this.referenceDataService.getData(this.referenceDataService.entityNames.locations);
        return locations.reduce((all, location) => ({ ...all, [location.LocationId]: location.NameLine1 }), {});
    }

    onSelectedLocationChanged = (locations) => {
        this.filteredLocations = locations.map(l => l.value);
    }

    ngOnDestroy() {
        this.locationChangeListener();
    }
}
