import { Component, OnInit, Input } from '@angular/core';
import { Location } from 'src/business-center/practice-settings/location';
import { PatientOverviewDetail, PendingEncounters } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'patient-pending-encounter',
  templateUrl: './patient-pending-encounter.component.html',
  styleUrls: ['./patient-pending-encounter.component.scss']
})
export class PatientPendingEncounterComponent implements OnInit {

  @Input() patient: PatientOverviewDetail;

  locations: Location[];
  PendingEncounters: PendingEncounters[];
  allPendingEncounters: PendingEncounters[];

  checkoutAllIsAllowed = false;
  multiLocationEncounterTooltip = "";
  disableAllPendingEncountersTooltip = "";
  noDeleteAccessTooltipMessage = "";
  patientEncounterView = false;
  soarAuthEnctrChkOutKey = "";
  soarAuthEnctrEditKey = "";
  soarAuthEnctrDeleteKey = "";
  getViewEncountersText = "";

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log('patient-pending-encounter');
    console.log(this.patient);
  }
}
