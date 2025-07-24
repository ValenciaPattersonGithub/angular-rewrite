import { Component, OnInit, Input, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';

@Component({
    selector: 'additional-info',
    templateUrl: './additional-info.component.html',
    styleUrls: ['./additional-info.component.scss']
})
export class AdditionalInfoComponent implements OnInit {
    @Input() nextAppointment: any;
    prevCareDue: any;
    patientGroups: any;
    additionalIdentifiers: any;
    nextApp: any;

    constructor(
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        @Inject('$routeParams') private route,
        @Inject('toastrFactory') private toastrFactory,
        private translate: TranslateService) { }

    ngOnInit() {
        this.initializeArrays();
        if (this.nextAppointment) {
            this.nextApp = this.nextAppointment;
        }
        this.getAdditionalInfo(this.route.patientId);
    }
    initializeArrays = () => {
        this.nextApp = [];
        this.additionalIdentifiers = [];
        this.patientGroups = [];
    }
    getAdditionalInfo = (patientId: any) => {
        this.patientCommunicationCenterService
            .getAdditionalInfoByPatientId(patientId)
            .subscribe((data: any) => this.getAdditionalInfoByPatientIdSuccess(data),
                error => this.getAdditionalInfoByPatientIdFailure());
    }
    getAdditionalInfoByPatientIdSuccess = (additionalInfo: any) => {
        if (additionalInfo) {
            if (additionalInfo.PatientIdentifierDescription) {
                this.additionalIdentifiers = additionalInfo.PatientIdentifierDescription;
            }
            if (additionalInfo.GroupDescription) {
                this.patientGroups = additionalInfo.GroupDescription;
            }
            if (additionalInfo.DateServiceDues) {
                this.prevCareDue = additionalInfo.DateServiceDues;
            }
        }
    }
    getAdditionalInfoByPatientIdFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the Additional Info.'),
            this.translate.instant('Server Error'));
    }
}
