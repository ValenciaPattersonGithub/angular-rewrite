import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RxService } from '../common/providers/rx.service';
declare let _: any;

@Component({
    selector: 'rx-user-setup',
    templateUrl: './rx-user-setup.component.html',
    styleUrls: ['./rx-user-setup.component.scss']
})
export class RxUserSetupComponent implements OnInit {
    roleList: any[];
    locationList: any[];

    initialized = false;
    showError = false;
    showEpcsCheckbox = false;
    public showRxChangeWarning = false;

    @Input() model: any;
    @Output() modelChange = new EventEmitter<any>();

    @Input() userId: string;

    constructor(
        @Inject('referenceDataService') private referenceDataService,
        private rxService: RxService,
        private translateService: TranslateService
    ) {
        const locations: any[] = referenceDataService.get(referenceDataService.entityNames.locations);
        this.locationList = locations.filter(location => location.IsRxRegistered).map(location => {
            return { text: location.NameAbbreviation, value: { legacyId: location.LocationId, enterpriseId: null }};
        });
    }

    ngOnInit() {
        this.roleList = [
            {text: 'Prescribing Clinician', value: 1},
            {text: 'Proxy Clinician', value: 6},
            {text: 'Reporting Clinician', value: 2},
            {text: 'EPCS Coordinator', value: 3},
            {text: 'Clinician Admin', value: 4},
            // {text: 'Prescribing Agent Clinician', value: 5},
        ];

        if (this.userId && this.userId != '') {
            this.rxService.getRxClinicianData(this.userId).then(res => {
                this.initialized = true;
                this.model.roles = _.intersectionWith(this.roleList, res.roles, (listRole, resRole) => listRole.value == resRole);
                this.model.locations = [];
                const locationDict = _.keyBy(this.locationList, 'value.legacyId');
                res.locations.forEach(location => {
                    const locListValue = locationDict[location.legacyId];
                    if (locListValue) {
                        locListValue.value.enterpriseId = location.enterpriseId;
                        this.model.locations.push(locListValue);
                    }
                });
                this.model.isNew = res.isNew;
                this.modelChange.emit(this.model);
            }, () => {
                this.showError = true;
            });
        } else {
            this.initialized = true;
        }
    }

    onChange(): void {
        if (this.model) {
            if (!this.model.isNew && (!this.model.locations || this.model.locations.length === 0)) {
                this.model.invalid = true;
                this.model.validationMessage = this.translateService.instant('You must select at least one location for ePrescriptions.');
            } else if (!this.model.isNew && (!this.model.roles || this.model.roles.length === 0)) {
                this.model.invalid = true;
                this.model.validationMessage = this.translateService.instant('You must select at least one role for ePrescriptions.');
            }
            else {
                this.model.invalid = false;
                this.model.validationMessage = '';
            }
        }
        this.modelChange.emit(this.model);
        const hasPrescribingRole = this.model && this.model.roles && (this.model.roles.findIndex(r => r.value === 1) >= 0) ? true : false;
        if (this.showEpcsCheckbox !== hasPrescribingRole) {
            this.model.isEPCSRequested = false;
        }
        this.showEpcsCheckbox = hasPrescribingRole;

        if (this.model && this.model.locations && this.model.locations.length > 0) {
            this.showRxChangeWarning = true;
        }
        else {
            this.showRxChangeWarning = false;
        }
    }

    toggleEpcs(): void {
        this.model.isEPCSRequested = !this.model.isEPCSRequested;
        this.onChange();
    }

}
