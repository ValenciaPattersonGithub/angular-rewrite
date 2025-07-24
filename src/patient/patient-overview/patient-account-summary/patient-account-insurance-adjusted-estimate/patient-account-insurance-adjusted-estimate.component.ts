import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/business-center/practice-settings/team-members/team-member';
import { PatientOverview } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'patient-account-insurance-adjusted-estimate',
  templateUrl: './patient-account-insurance-adjusted-estimate.component.html',
  styleUrls: ['./patient-account-insurance-adjusted-estimate.component.scss']
})
export class PatientAccountInsuranceAdjustedEstimateComponent implements OnInit {

  @Input() adjEstimateLoading: boolean;
  @Input() adjustedEstIns: number;
  @Input() person: PatientOverview;
  @Input() providers: User;

  totalAdjustedEstimate = 0;
  currentPerson: PatientOverview;
  selectedMemberAdjustedEstimate = 0;
  soarAuthInsPaymentViewKey = "";
  soarAuthAddCreditAdjustmentKey = "";
  soarAuthAddDebitTransactionKey = "";
  hasPatientInsurancePaymentViewAccess = "";
  calculatingBalance = false;
  selectedPatientId = "";

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-account-insurance-adjusted-estimate");
    console.log(this.adjEstimateLoading);
    console.log(this.adjustedEstIns);
    console.log(this.person);
    console.log(this.providers);
  }

}
