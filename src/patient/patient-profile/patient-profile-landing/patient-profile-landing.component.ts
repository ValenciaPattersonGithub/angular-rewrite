import { Component, Inject, OnDestroy, OnInit, SecurityContext, TemplateRef, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FuseFlag } from "src/@core/feature-flags";
import { ToastService } from "src/@shared/components/toaster/toast.service";
import { FeatureFlagService } from "src/featureflag/featureflag.service";
import { PatientCommunicationCenterService } from "src/patient/common/http-providers/patient-communication-center.service";
import { PatientRegistrationService } from "src/patient/common/http-providers/patient-registration.service";
import { RegistrationEvent } from "src/patient/common/models/enums";
import { RegistrationCustomEvent } from "src/patient/common/models/registration-custom-event.model";
declare let _: any;

@Component({
    selector: "app-patient-profile-landing",
    templateUrl: "./patient-profile-landing.component.html",
    styleUrls: ["./patient-profile-landing.component.scss"],
})
export class PatientProfileLandingComponent implements OnInit, OnDestroy {
    patientInfo: any;
    patientDetail: Observable<any>;
    private unsubscribe$: Subject<any> = new Subject<any>();
    @ViewChild("noResponisblePersonContent") noResponisblePersonContent: TemplateRef<any>;
    hideReferral: boolean = true;
    patientProfileForReferrals: any;
    editPersonProfileMFE: boolean;
    constructor(
        @Inject("$routeParams") private route,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        private registrationService: PatientRegistrationService,
        private toastService: ToastService,
        private featureFlagService: FeatureFlagService,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this.checkFeatureFlags();
        this.getPatientInfo();
        this.registrationService
            .getRegistrationEvent()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((event: RegistrationCustomEvent) => {
                if (event) {
                    switch (event.eventtype) {
                        case RegistrationEvent.PerformNavigation:
                            this.navigateToUrl(event.data);
                            break;
                    }
                }
            });
    }
    getPatientInfo = () => {
        this.patientCommunicationCenterService.getPatientInfoByPatientId(this.route.patientId).subscribe(
            (patientInfo: any) => this.getPatientInfoByPatientIdSuccess(patientInfo),
            (error) => this.getPatientInfoByPatientIdFailure()
        );
    };
    getPatientInfoByPatientIdSuccess = (res: any) => {
        if (res) {
            this.patientInfo = res;
            this.patientInfo.PatientId = this.route.patientId;
            if (!this.patientInfo.ResponsiblePersonName) {
                this.toastService.show(
                    {
                        type: "error",
                        title: " A responsible person must be assigned to access the account.",
                        template: this.noResponisblePersonContent,
                    },
                    false
                );
            }
            this.patientProfileForReferrals = this.patientInfo;
            this.patientProfileForReferrals["workphone"] = this.patientInfo.PhoneNumbers != null
                && this.patientInfo.PhoneNumbers?.find(x => x.Type == 'Work') != null ?
                this.patientInfo.PhoneNumbers?.find(x => x.Type == 'Work')?.PhoneNumber : '000-000-0000';
            this.patientProfileForReferrals["phone"] = this.patientInfo.PhoneNumbers != null
                && this.patientInfo.PhoneNumbers?.find(x => x.IsPrimary) != null ?
                this.patientInfo.PhoneNumbers.find(x => x.IsPrimary)?.PhoneNumber : '000-000-0000';
            this.patientProfileForReferrals["isMobile"] = this.patientInfo.PhoneNumbers != null
                && this.patientInfo.PhoneNumbers?.find(x => x.IsPrimary && x.Type == 'Mobile') != null ?
                true : false;
            this.patientProfileForReferrals["email"] = this.patientInfo.Emails?.find(e => e.IsPrimary)?.Email;
        }
    };
    getPatientInfoByPatientIdFailure = () => {};
    updatePerson = () => {
        let url = `#/Patient/${this.route.patientId}/Person?sectionId=1`;
        if(this.editPersonProfileMFE) {
            url = url.replace('#/Patient/', '#/patientv2/');
        }
        window.location.href = this.sanitizer.sanitize(SecurityContext.URL, url);
    };
    navigateToUrl = (url: string) => {
        window.location.href = _.escape(url);
    };
    ngOnDestroy() {
        this.toastService.close();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    checkFeatureFlags() {
        this.featureFlagService.getOnce$(FuseFlag.ShowPatientReferralsOnClinical).subscribe((value) => {
            this.hideReferral = !value;
        });

        this.featureFlagService.getOnce$(FuseFlag.EnableEditProfileMFEPage).subscribe((value) => {
            this.editPersonProfileMFE = value;
        });
    };
    
}
