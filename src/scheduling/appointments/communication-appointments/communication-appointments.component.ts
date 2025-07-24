import { Component, OnInit } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { CommunicationEvent } from 'src/patient/common/models/enums';
@Component({
    selector: 'communication-appointments',
    templateUrl: './communication-appointments.component.html',
    styleUrls: ['./communication-appointments.component.scss']
})
export class CommunicationAppointmentsComponent implements OnInit {

    constructor(private patientCommunicationCenterService: PatientCommunicationCenterService) { }

    ngOnInit() {
    }
    addAppointment = () => {
        this.patientCommunicationCenterService.setCommunicationEvent(
            {
                eventtype: CommunicationEvent.AddAppointment,
                data: null
            });
    }
}
