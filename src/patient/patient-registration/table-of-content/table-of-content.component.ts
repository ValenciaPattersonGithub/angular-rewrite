import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
import { FuseFlag } from 'src/@core/feature-flags';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
@Component({
    selector: 'table-of-content',
    templateUrl: './table-of-content.component.html',
    styleUrls: ['./table-of-content.component.scss']
})
export class TableOfContentComponent implements OnInit, OnDestroy {

    private unsubscribe$: Subject<any> = new Subject<any>();
    tableofContent: any[];
    selectedItem: any;
    releseOldReferral: boolean = false;
    enableNewReferral: boolean = false;
    constructor(
        private translate: TranslateService,
        private registrationService: PatientRegistrationService,
        private featureFlagService: FeatureFlagService,
        @Inject('$routeParams') public route
    ) { }
        

    ngOnInit() {
        this.tableofContent = [
            { id: 1, text: this.translate.instant('Personal Details') },
            { id: 2, text: this.translate.instant('Contact Details') },
            { id: 3, text: this.translate.instant('Insurance') },
            { id: 4, text: this.translate.instant('Preferences') },
            { id: 5, text: this.translate.instant('Dental Records') },
            { id: 6, text: this.translate.instant('Referrals') },
            { id: 7, text: this.translate.instant('Additional Identifiers') },
            { id: 8, text: this.translate.instant('Documents') },
            { id: 9, text: this.translate.instant('Account Members') }
        ];
        if (this.route.patientId){
            const index = this.tableofContent.findIndex(item => item.id === 6);
            if (index !== -1) {
                this.tableofContent.splice(index, 1);
            }
        }
        this.selectedItem = this.tableofContent[0];
        this.registrationService.getRegistrationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (event: RegistrationCustomEvent) => {
                if (event) {
                    switch (event.eventtype) {
                        case RegistrationEvent.SelectedMenu:
                            this.selectedItem = this.tableofContent[event.data];

                    }
                }
            }
        );
        this.checkFeatureFlags();
    }

    setSelectedItem = (item: any) => {
        this.registrationService.setRegistrationEvent({
            eventtype: RegistrationEvent.FocusSection,
            data: item
        });
    }
    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    checkFeatureFlags() {
        this.featureFlagService.getOnce$(FuseFlag.ReleseOldReferral).subscribe((value) => {
            this.releseOldReferral = value;
        });
        this.featureFlagService.getOnce$(FuseFlag.ReleseEnableReferralNewPatientSection).subscribe((value) => {
            this.enableNewReferral = value;
        });
    };
}
