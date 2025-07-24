import { Component, OnInit } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
@Component({
    selector: 'communication-patient-drawer',
    templateUrl: './communication-patient-drawer.component.html',
    styleUrls: ['./communication-patient-drawer.component.scss']
})
export class CommunicationPatientDrawerComponent implements OnInit {
    patientDetail: any;
    patientInfo: any;
    nextAppointment: any;


    constructor(
        private patientCommunicationCenterService: PatientCommunicationCenterService
    ) { }

    ngOnInit() {
        const patientdetail = this.patientCommunicationCenterService.patientDetail;
        if (patientdetail) {
            this.patientDetail = patientdetail;
        }
        const nextappointment = this.patientCommunicationCenterService.NextAppointment;
        if (nextappointment) {
            this.nextAppointment = nextappointment;
        }
    }
}
