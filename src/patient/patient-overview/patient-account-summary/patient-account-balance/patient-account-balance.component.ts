import { Component, OnInit, Input } from '@angular/core';
import { AccountMembersAccountInfo } from 'src/patient/common/models/account-members-account-info.model';
import { GraphData, PatientOverviewDetail } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'patient-account-balance',
  templateUrl: './patient-account-balance.component.html',
  styleUrls: ['./patient-account-balance.component.scss']
})
export class PatientAccountBalanceComponent implements OnInit {

  @Input() person: PatientOverviewDetail;
  @Input() accountTotalLoading: boolean;
  @Input() accountTotal: number;
  @Input() accountBalances: AccountMembersAccountInfo[];
  @Input() graphData: GraphData;

  balanceCurrentPercentage: number;
  balanceOverduePercentage: number;
  balanceDelinquentPercentage: number;

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-account-balance");
    console.log(this.person);
    console.log(this.accountTotalLoading);
    console.log(this.accountTotal);
    console.log(this.accountBalances);
    console.log(this.graphData);
  }

}
