import { Component, Inject, Input, OnInit, OnDestroy } from '@angular/core';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { TreatmentPlanEditServicesService } from 'src/treatment-plans/component-providers/treatment-plan-edit-services.service';
import { RxService } from '../../../rx/common/providers/rx.service';
import { Subscription } from 'rxjs';

import { FuseFlag } from '../../../@core/feature-flags';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
 
@Component({
    selector: 'patient-secondary-navigation',
    templateUrl: './patient-secondary-navigation.component.html',
    styleUrls: ['./patient-secondary-navigation.component.scss']
})
export class PatientSecondaryNavigationComponent implements OnInit, OnDestroy {
    private patientId: any;
    @Input() patientDetail: any;
    summaryFlyOutVisibility = false;
    isSummaryDisabled = false;
    availableImagingProviders: any[];
    imageFlyoutVisibility = false;
    healthAuthAbbreviation = 'soar-clin-cmed-view';
    perioAuthAbbreviation = 'soar-clin-cperio-view';
    imagesAuthAbbreviation = 'soar-clin-cimgs-view';
    rxAuthAbbreviation = 'soar-clin-clinrx-view';
    caesyCloudAuthAbbreviation = 'soar-clin-ceduc-view';
    hasHealthAccess: any;
    hasPerioAccess: any;
    hasImagesAccess: any;
    hasRXAccess: any;
    hasRxAccessAtCurrentLocation: any;
    hasCaesyCloudAccess: any;
    categoryParam: any;
    navigationDisable: any = false;
    enableOrthodonticContracts: any = false;        
    //navclicked: boolean = false;
    //@Output () navClicked = new EventEmitter<string>();
    //private treatmentPlanEditServicesService: TreatmentPlanEditServicesService;
    private navCancel: string;
    private subscription: Subscription;

    constructor(
        @Inject('$routeParams') routeParams,
        private patientService: PatientHttpService,
        private treatmentPlanService: TreatmentPlanEditServicesService,
        @Inject('CommonServices') private commonServices: any,
        @Inject('ImagingMasterService') private imagingService,
        @Inject('ImagingProviders') private imagingProviders,
        @Inject('tabLauncher') private tabLauncher,
        @Inject('patSecurityService') private patSecurityService,
        private rxService: RxService,
        @Inject('$rootScope') private $rootScope,
        @Inject('locationService') private locationService,
        private featureFlagService: FeatureFlagService
    ) {
        this.patientId = routeParams.patientId;
        this.categoryParam = routeParams.Category;
        this.navigationDisable = routeParams.disableSecondaryNavigation === true;
    }

    async ngOnInit() {
        await this.authAccess();

        if (this.patientDetail && this.patientDetail.PersonAccount) {
            this.patientService.
                getPatientAccountOverviewByAccountId(this.patientDetail.PersonAccount.AccountId)
                .then(this.accountOverviewSuccess, this.accountOverviewFailed);
        } else {
            this.isSummaryDisabled = true;
            this.summaryFlyOutVisibility = false;
        }

        
        this.checkFeatureFlags();
        this.getImagingOptions();
        this.subscription?.add(this.treatmentPlanService.esCancelEvent.subscribe((data: string) => {
            this.navCancel = data;
        }));
    }
    
    checkFeatureFlags() {
        this.featureFlagService.getOnce$(FuseFlag.EnableOrthodonticContracts).subscribe(value => {
            this.enableOrthodonticContracts = value;
        });
    }

    navigate = (url: any, event: any) => {

        if (url) {
            const baseurl = `#/Patient/${this.patientId}/`;
            let destination = `${baseurl}${url}`;

            if (this.navCancel === 'Edit Services') {

                this.treatmentPlanService.navClicked(destination);
            }
            else {

                if (window.location.href.includes(destination)) {
                    //if the user is trying to navigate to the same url they have always been on, check to see if the treatment plan overlay is open.
                    let closeTXPlanButton = document.getElementById('closeTxPlanButton');

                    if (closeTXPlanButton) {
                        // the treatment plan overlay is open, we just need to close it and carry on as usual.
                        closeTXPlanButton.click();
                    }
                }

                window.location.href = destination;
            }

        }
        event.stopPropagation();
    }

    launchTab = (event: any) => {
        if (this.hasCaesyCloudAccess) {
            let url = 'https://pca.pattersoncompanies.com/signin/signin.aspx?';
            url += 'wa=wsignin1.0&wtrealm=https%3a%2f%2fwww.caesycloud.com&';
            url += 'wctx=rm%3d0%26id%3dpassive%26ru%3d%252fPresentations%252flist.aspx&';
            url += 'wct=2017-10-16T13%3a59%3a44Z&application=caesycloud';
            this.tabLauncher.launchNewTab(url);
            event.stopPropagation();
        }
    }

    accountOverviewSuccess = (res: any) => {
        if (res && res.AccountMembersAccountInfo
            && res.AccountMembersAccountInfo.length === 1
            && this.patientDetail.ResponsiblePersonType === 1) {
            this.summaryFlyOutVisibility = false;
        } else if (res && res.AccountMembersAccountInfo
            && res.AccountMembersAccountInfo.length > 1 &&
            (this.patientDetail.ResponsiblePersonType === 1 || this.patientDetail.ResponsiblePersonType === 2)) {
            this.summaryFlyOutVisibility = true;
        }

    }

    accountOverviewFailed = (res: any) => {
        this.summaryFlyOutVisibility = false;
    }

    getImagingOptions = () => {
        this.imagingService.getServiceStatus().then(this.getServiceSuccess);
    }

    getServiceSuccess = (res: any) => {
        this.availableImagingProviders = [];
        if (res.blue && res.blue.status === 'ready') {
            this.availableImagingProviders.push({ name: 'Blue Imaging', provider: this.imagingProviders.Blue });
        }
        if (res.apteryx && res.apteryx.status === 'ready') {
            this.availableImagingProviders.push({ name: 'XVWeb', provider: this.imagingProviders.Apteryx });
        }
        if (res.apteryx2 && res.apteryx2.status === 'ready') {
            this.availableImagingProviders.push({ name: 'XVWeb', provider: this.imagingProviders.Apteryx2 });
        }
        if (res.sidexis) {
            if (res.sidexis.status === 'ready') {
                this.availableImagingProviders.push({ name: 'Sidexis', provider: this.imagingProviders.Sidexis });
            } else if (res.sidexis.status === 'error') {
                this.availableImagingProviders.push({
                    name: 'Sidexis', provider: this.imagingProviders.Sidexis,
                    error: true, message: 'Sidexis not available.'
                });
            }
        }
        this.setImagingOptions();
    }

    setImagingOptions = () => {
        if (this.availableImagingProviders.length === 1) {
            const provider = this.availableImagingProviders[0].provider;
            switch (provider) {
                case this.imagingProviders.Apteryx2:
                case this.imagingProviders.Apteryx:
                case this.imagingProviders.Blue:
                    this.imageFlyoutVisibility = false;
                    break;
                case this.imagingProviders.Sidexis:
                    this.imageFlyoutVisibility = true;
                    break;
            }
        }
        // show dropdown if more than one imaging provider
        if (this.availableImagingProviders.length > 1) {
            this.imageFlyoutVisibility = true;
        }
        if (this.availableImagingProviders.length === 0) {
            this.imageFlyoutVisibility = false;
        }
    };

    authAccess = async () => {
        this.hasRXAccess = false;
        this.hasRxAccessAtCurrentLocation = false;

        this.hasHealthAccess = this.authAccessByType(this.healthAuthAbbreviation);
        this.hasPerioAccess = this.authAccessByType(this.perioAuthAbbreviation);
        this.hasImagesAccess = this.authAccessByType(this.imagesAuthAbbreviation);
        this.hasCaesyCloudAccess = this.authAccessByType(this.caesyCloudAuthAbbreviation);

        var hasFuseRxAccess = this.authAccessByType(this.rxAuthAbbreviation);

        let practiceSettings = (await this.commonServices.PracticeSettings.Operations.Retrieve()).Value;

        const practiceId = this.locationService.getCurrentLocation().practiceid;

        if (practiceSettings && practiceSettings.PracticeId == practiceId) {

            this.rxService.rxAccessCheck(this.$rootScope.patAuthContext.userInfo.userid).then(res => {
                this.hasRxAccessAtCurrentLocation = res.result;

                this.hasRXAccess = hasFuseRxAccess && this.hasRxAccessAtCurrentLocation;
            }).catch(() => {
                this.hasRxAccessAtCurrentLocation = false;
                this.hasRXAccess = false;
            });
        }
    }

    authAccessByType = (authtype: string) => {
        const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result;
    }

    ngOnDestroy() {
        this.treatmentPlanService?.esCancelEvent?.unsubscribe();
        this.subscription?.unsubscribe();
    }
}
