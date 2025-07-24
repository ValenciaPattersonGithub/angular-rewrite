import { Component, OnInit, Input } from '@angular/core';
import { MedicalHistoryAlert } from 'src/patient/common/models/medical-history-alert.model';
import { PatientOverview } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'patient-alert-flags',
  templateUrl: './patient-alert-flags.component.html',
  styleUrls: ['./patient-alert-flags.component.scss']
})
export class PatientAlertFlagsComponent implements OnInit {

  @Input() person: PatientOverview;

  hasViewAccess = false;
  masterAlerts: MedicalHistoryAlert[];
  customAlerts: MedicalHistoryAlert[];
  patientMedicalHistoryAlerts: MedicalHistoryAlert[];
  editing = false;

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-alert-flags");
    console.log(this.person);
  }

}
