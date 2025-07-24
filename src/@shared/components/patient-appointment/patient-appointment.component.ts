import { Component, OnInit, Input } from '@angular/core';
import { PreventiveCareService } from 'src/@shared/providers/preventive-care.service';
import { AatientAppointmentActions, AccountValidation, AppointmentOverview, PatientOverviewDetail } from 'src/patient/common/models/patient-overview.model';
import { Patient } from 'src/patient/common/models/patient.model';

@Component({
  selector: 'patient-appointment',
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.scss']
})
export class PatientAppointmentComponent implements OnInit {

  @Input() patient: PatientOverviewDetail;
  @Input() showAppointments: string;

  accountValidation: AccountValidation[];
  appointments: AppointmentOverview[];
  patientAppointmentActions: AatientAppointmentActions[];
  allMembers: Patient;
  originalPatient: Patient;
  preventiveServices: PreventiveCareService[];

  accountView = false;
  loading = false;
  timeIncrement = 5;
  loadingMessageNoResults = "";
  patientId = "";
  accountId = "";
  lastStatusId = "";
  appointmentCount = 0;
  patientAppointmentCount = 0;
  enableNewAppointmentDrawerDisplay = false;
  sentForCheckout = false;


  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-appointment");
    console.log(this.patient);
    console.log(this.showAppointments);
  }

}
