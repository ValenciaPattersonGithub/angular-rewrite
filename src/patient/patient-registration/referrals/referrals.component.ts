import { Component, OnInit, Inject, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BroadcastService } from 'src/@shared/providers/broad-cast.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
@Component({
    selector: 'referrals',
    templateUrl: './referrals.component.html',
    styleUrls: ['./referrals.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ReferralsComponent implements OnInit {
    @Input() Referrals: FormGroup;
    sources: Array<{ text: string, value: number }> = [];
    showSources: boolean;
    showPersonSearch: boolean;
    responsiblePersonName: any;
    constructor(
        private registrationService: PatientRegistrationService,
        private translate: TranslateService,
        @Inject('toastrFactory') private toastrFactory,
        private broadCastService: BroadcastService
    ) { }

    ngOnInit(): void {
        this.getSources();
        this.handleEvents();
        this.broadCastService.messagesOfType('referralSources').subscribe(message => {
            this.updateSources(message);
        });
    }
    updateSources = (message: any) => {
        if (message) {
            const payload = message.payload;
            if (payload.mode === 'add') {
                this.sources.push({ text: payload.data.SourceName, value: payload.data.PatientReferralSourceId });
            } else if (payload.mode === 'update') {
                const identifier = this.sources.
                    filter(x => x.value === payload.data.PatientReferralSourceId);
                if (identifier && identifier.length) {
                    identifier[0].text = payload.data.SourceName;
                }
            } else if (payload.mode === 'delete') {
                const index = this.sources.
                    findIndex(x => x.value === payload.data.PatientReferralSourceId);
                this.sources.splice(index, 1);
            }
        }
    }
    onReferralTypeSelected = (event: any) => {
        this.showSources = (event.target.value === '1');
        this.showPersonSearch = (event.target.value === '2');
        this.responsiblePersonName = '';
        this.Referrals.patchValue({
            ReferralSourceId: '',
            SourceDescription1: '',
        });
    }
    getSources = () => {
        this.registrationService.getReferralSources()
            .subscribe((data: any) => this.getReferralSourcesSuccess(data),
                error => this.getReferralSourcesFailure());
    }
    getReferralSourcesSuccess = (res: any) => {
        if (Object.keys(res).length) {
            this.sources = [];
            res.forEach((source: any) => {
                this.sources.push({ text: source.SourceName, value: source.PatientReferralSourceId });
            });
        }
    }
    getReferralSourcesFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the Referral Sources Information.'),
            this.translate.instant('Server Error'));
    }
    onReferralSelected = (event: any) => {
        if (event.target.value && event.target.value !== '0') {
            const selectedReferral = this.sources.filter(x => x.value === event.target.value)[0];
            this.Referrals.patchValue({
                SourceDescription1: selectedReferral.text
            });
        }
        else {
            this.Referrals.patchValue({
                SourceDescription1: ''
            });
        }
    }
    handleEvents = () => {
        this.registrationService.getRegistrationEvent().pipe().subscribe(
            (event: RegistrationCustomEvent) => {
                if (event) {
                    switch (event.eventtype) {
                        case RegistrationEvent.PatchReferralResponsiblePersonName:
                            if (event.data) {
                                this.responsiblePersonName = event.data;
                            }
                            break;

                    }
                }
            }
        );
        if (this.Referrals) {
            this.Referrals.valueChanges.subscribe((refferal: any) => {
                this.showSources = (Number(refferal.ReferralType) === 1);
                this.showPersonSearch = (Number(refferal.ReferralType) === 2);
            });
        }
    }
    onSelectedValueChanged = (selectedValue: any) => {
        if (selectedValue) {
            this.Referrals.patchValue({
                SourceDescription1: `${selectedValue.LastName} ${selectedValue.FirstName}`,
                ReferralSourceId: selectedValue.PatientId
            });
        }
    }
}
