import { Component, OnInit, Input } from '@angular/core';
import { GraphData, PatientOverview } from 'src/patient/common/models/patient-overview.model';
import { AccountMembersAccountInfo } from 'src/patient/common/models/account-members-account-info.model';
import { ProviderUser } from 'src/practices/common/models/provider-user.model';
@Component({
  selector: 'patient-account-summary',
  templateUrl: './patient-account-summary.component.html',
  styleUrls: ['./patient-account-summary.component.scss']
})
export class PatientAccountSummaryComponent implements OnInit {

  @Input() person: PatientOverview;

  accountBalances: AccountMembersAccountInfo[];
  accountMembersOptions: []; //ToDo: Not used in any functionality, kindly check and remove if not in use
  providers: ProviderUser[];
  graphData = new GraphData();

  loading = false;
  balanceIsCalculated = false;
  accountBalance = 0;
  accountTotal = 0;
  estimatedInsurance = 0;
  patientPortion = 0;
  accountTotalOverview = 0;
  accountBalanceOverview = 0;
  estimatedInsuranceOverview = 0;
  patientPortionOverview = 0;
  applyingPayment = false;
  disablePayments = true;
  disableInsurancePayments = false;
  personId = "0";
  accountSummaryActions = {}; //ToDo: Check exact values while migration
  fadeIn = false;
  fadeOut = false;

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-account-summary");
    console.log(this.person);
  }

  makeInsurancePayment = () => {
    console.log("makeInsurancePayment");
  }

  makePayment = () => {
    console.log("makePayment");
  }
}
