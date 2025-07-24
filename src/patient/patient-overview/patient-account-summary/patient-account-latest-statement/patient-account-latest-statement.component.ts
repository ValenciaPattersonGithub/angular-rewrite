import { Component, OnInit, Input } from '@angular/core';
import { AccountStatementDto, PatientOverviewDetail } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'patient-account-latest-statement',
  templateUrl: './patient-account-latest-statement.component.html',
  styleUrls: ['./patient-account-latest-statement.component.scss']
})
export class PatientAccountLatestStatementComponent implements OnInit {

  @Input() person: PatientOverviewDetail;
  @Input() personId: string;

  isAtLeastOneStatement = false;
  accountStatement: AccountStatementDto[];

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-account-latest-statement");
    console.log(this.person);
    console.log(this.personId);
  }

}
