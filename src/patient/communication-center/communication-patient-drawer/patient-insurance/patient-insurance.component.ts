import { Component, OnInit, Inject } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'patient-insurance',
    templateUrl: './patient-insurance.component.html',
    styleUrls: ['./patient-insurance.component.scss']
})
export class PatientInsuranceComponent implements OnInit {

    insurnceInfo: any;
    patientName: string;
    totalPlans: any;
    constructor(@Inject('$routeParams') private route,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        @Inject('toastrFactory') private toastrFactory,
        private translate: TranslateService,
        @Inject('tabLauncher') private tabLauncher) { }

    ngOnInit() {
        this.insurnceInfo = {};
        this.getPrimaryPatientBenefitPlan(this.route.patientId)
    }
    getPrimaryPatientBenefitPlan = (patientId: any) => {
        this.patientCommunicationCenterService
            .getPrimaryPatientBenefitPlanByPatientId(patientId)
            .subscribe((data: any) => this.getPrimaryPatientBenefitPlanByPatientIdSuccess(data),
                error => this.getPrimaryPatientBenefitPlanByPatientIdFailure());
    }
    getPrimaryPatientBenefitPlanByPatientIdSuccess = (res: any) => {
        if (res) {
            this.insurnceInfo = res;
            this.totalPlans = res.TotalBenifitPlan;
            this.getDisplayName(this.insurnceInfo);
        }
    }
    getPrimaryPatientBenefitPlanByPatientIdFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the Insurance Information.'),
            this.translate.instant('Server Error'));
    }
    getDisplayName = (insurnceInfo: any) => {
        if (insurnceInfo) {
            const patient = insurnceInfo;
            let name;
            if (patient) {
                if (patient.PolicyHolderLastName) {
                    name = patient.PolicyHolderLastName;
                }
                if (patient.Suffix) {
                    name += ' ' + patient.Suffix;
                }
                if (patient.PolicyHolderFirstName) {
                    name += ', ' + patient.PolicyHolderFirstName;
                }
                if (patient.PolicyHolderMiddleName) {
                    name += ' ' + patient.PolicyHolderMiddleName[0];
                }
                if (patient.PolicyHolderPreferredName) {
                    name += ' (' + patient.PolicyHolderPreferredName + ')';
                }
                this.patientName = name;
            }
        }
        return true;
    }
    insuranceInformation = () => {
        if (this.route.patientId) {
            this.tabLauncher.launchNewTab(`#/Patient/${this.route.patientId}/Summary/?tab=Insurance%20Information`);
        }
    }
    onNavigate(website: any){
        if (website) {
            this.tabLauncher.launchNewTab(website);
        }
    }

}
