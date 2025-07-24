import { Component, OnInit, Inject, OnChanges, SimpleChanges, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TreatmentPlanEditServicesService } from 'src/treatment-plans/component-providers/treatment-plan-edit-services.service';
import { MenuHelper, MenuItem } from '../../providers/menu-helper';
import escape from 'lodash/escape';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnChanges {
    isSRHEnabled: boolean = false;
    selected: any;
    isInDeveloperMode: boolean = false;
    private navCancel: string;
    showDashboardToolTip = false;
    showScheduleToolTip = false;
    showPatientsToolTip = false;
    showBusinessToolTip = false;
    showEngagementToolTip = false;
    showHelpToolTip = false;
    showPSToolTip = false;
    practiceHasPayerReport = false;    
    isPatientOverview = false; 
    showScheduleV2 = false; 
    showScheduleV2Alt = false; 
    showLegacySchedule = false; 
    navItems: any[] = [
        { Name: 'dashboard', Path: '/Dashboard/' },
        { Name: 'schedule', Path: '/Schedule/' },
        { Name: 'patient', Path: '/Patient/' },
        { Name: 'business', Path: '/BusinessCenter/' },
        { Name: 'help', Path: '/Help/' }];

    PathBindings = {
        Dashboard: "#/Dashboard/",
        Schedule: "#/Schedule/",
        Patient: "#/Patient/",
        PracticeAtAGlance: "#/BusinessCenter/PracticeAtAGlance",
        PracticeSettings: "#/BusinessCenter/PracticeSettings",    
        PatientOverview: "#/patientv2",
        ScheduleV2: "#/schedule/v2",
        ScheduleV2Alt: "#/schedule/alt-v2",
        Engagement: "#/Engagement/",
        Help: "#/Help/",
    }
    
    businessMenuItems: MenuItem[];
    patientMenuItems: MenuItem[];

    constructor(
        @Inject('tabLauncher') private tabLauncher,
        @Inject('$location') private location,
        @Inject('LocationServices') private locationServices,
        @Inject('FeatureService') private featureService,
        private treatmentPlanService: TreatmentPlanEditServicesService,
        private menuHelper: MenuHelper,
        @Inject('PayerReportsService') private payerReportsService,
        private sanitizer: DomSanitizer,        
        private featureFlagService: FeatureFlagService
    ) { }

    ngOnInit() {
        this.initNavSelect();
        this.featureService.isEnabled('DevelopmentMode').then((res: any) => {
            this.isInDeveloperMode = res;
        });
        this.getLocationSRHEnrollmentStatus();
        this.treatmentPlanService.esCancelEvent.subscribe((data: string) => {
            this.navCancel = data;
        });

        this.payerReportsService.PracticeHasPayerReport({}).$promise.then((res) => {
            this.practiceHasPayerReport = res.Value;
        });    
        

        this.featureFlagService.getOnce$(FuseFlag.ShowPatientOverview).subscribe((value) => {
            this.isPatientOverview = value;
        });



        this.businessMenuItems = this.menuHelper.businessMenuItems();
        this.patientMenuItems = this.menuHelper.patientMenuItems();
        

        const showScheduleV2Observable = this.featureFlagService.getOnce$(FuseFlag.ShowScheduleV2).pipe(take(1));
        const showScheduleV2AltObservable = this.featureFlagService.getOnce$(FuseFlag.ShowScheduleV2Alt).pipe(take(1));
        const showLegacyScheduleObservable = this.featureFlagService.getOnce$(FuseFlag.ShowLegacySchedule).pipe(take(1));
        combineLatest([showScheduleV2Observable, showScheduleV2AltObservable, showLegacyScheduleObservable]).subscribe({
            next: ([showScheduleV2, showScheduleV2Alt, showLegacySchedule]) => {          
              this.showScheduleV2 = showScheduleV2;
              this.showScheduleV2Alt = showScheduleV2Alt;
          
              // legacy schedule needs to show if showScheduleV2 is false or showLegacySchedule is true
              this.showLegacySchedule = showScheduleV2 == false || showLegacySchedule;
            }
          });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['selected']) {
            this.selected = changes['selected'];
        }
    }


    navigate(url) {
        this.tabLauncher.launchNewTab(escape('/v1.0/index.html' + url));
    };

    initNavSelect() {
        for (let i = 0; i < this.navItems.length; i++) {
            if (this.location.$$path && this.location.$$path.indexOf(this.navItems[i].Path) > -1 && this.navItems[i].Path.length > 1) {
                this.selected = this.navItems[i].Name;
            }
        }
    };

    getLocationSRHEnrollmentStatus() {
        const cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        if (cachedLocation) {
            this.locationServices.getLocationSRHEnrollmentStatus({ locationId: cachedLocation.id })
                .$promise
                .then((res: any) => {
                    this.getLocationSRHEnrollmentStatusSuccess(res);
                });
        }
    }

    getLocationSRHEnrollmentStatusSuccess(res) {
        if (res) {
            this.isSRHEnabled = res.Result;
        }
    };

    leftNavClicked(url) {
        if (this.navCancel === 'Edit Services') {
            this.treatmentPlanService.navClicked(this.sanitizer.sanitize(SecurityContext.URL, url));
        } else {
            window.location.href = this.sanitizer.sanitize(SecurityContext.URL, url);
        }
    }
    businessMenuClicked($event) {
        this.showBusinessToolTip = false;
        window.location.href = this.sanitizer.sanitize(SecurityContext.URL, $event.Url);
    }
    patientMenuClicked($event) {
        this.showPatientsToolTip = false;
        window.location.href = this.sanitizer.sanitize(SecurityContext.URL, $event.Url);
    }
}
