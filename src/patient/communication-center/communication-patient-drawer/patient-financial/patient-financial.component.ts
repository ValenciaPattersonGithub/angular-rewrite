import { Component, OnInit, Input, Inject } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'patient-financial',
    templateUrl: './patient-financial.component.html',
    styleUrls: ['./patient-financial.component.scss']
})
export class PatientFinancialComponent implements OnInit {

    @Input() patientProfile: any;
    patientDiscount: any;

    constructor(@Inject('$routeParams') private route,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        @Inject('toastrFactory') private toastrFactory,
        private translate: TranslateService) { }

    ngOnInit() {
        if (!this.patientProfile) {
            this.initializePatientProfile();
        } else {
            this.getPatientDiscount(this.route.patientId)
        }
    }
    getPatientDiscount = (patientId: any) => {
        this.patientCommunicationCenterService
            .getPatientDiscountByPatientId(patientId)
            .subscribe((data: any) => this.getPatientDiscountByPatientIdSuccess(data),
                error => this.getPatientDiscountByPatientIdFailure());
    }
    getPatientDiscountByPatientIdSuccess = (res: any) => {
        if (res) {
            this.patientDiscount = res.DiscountName;
        } else {
            this.patientDiscount = this.translate.instant('N/A');
        }
    }
    getPatientDiscountByPatientIdFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the Patient Financial Information.'),
            this.translate.instant('Server Error'));
    }
    initializePatientProfile = () => {
        this.patientProfile = {
            PersonAccount: {}
        };
    }
}
