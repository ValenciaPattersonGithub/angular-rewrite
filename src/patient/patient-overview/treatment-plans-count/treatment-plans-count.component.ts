import { Component, OnInit, Input } from '@angular/core';
import { PatientOverview } from '../../common/models/patient-overview.model';

@Component({
  selector: 'treatment-plans-count',
  templateUrl: './treatment-plans-count.component.html',
  styleUrls: ['./treatment-plans-count.component.scss']
})
export class TreatmentPlansCountComponent implements OnInit {

  @Input() person: PatientOverview;

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("treatment-plans-count");
    console.log(this.person);
  }

}
