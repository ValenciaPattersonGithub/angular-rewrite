import { Component, OnInit, Input } from '@angular/core';
import { PatientOverview } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'patient-preventive-care',
  templateUrl: './patient-preventive-care.component.html',
  styleUrls: ['./patient-preventive-care.component.scss']
})
export class PatientPreventiveCareComponent implements OnInit {

  @Input() person: PatientOverview;

  nextPrev = "";

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-preventive-care");
    console.log(this.person);
  }

}
