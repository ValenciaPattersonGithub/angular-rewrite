import { Component, OnInit, Input } from '@angular/core';
import { BenefitPlan } from 'src/patient/common/models/benefit-plan.model';
import { PatientOverview } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'patient-account-insurance',
  templateUrl: './patient-account-insurance.component.html',
  styleUrls: ['./patient-account-insurance.component.scss']
})
export class PatientAccountInsuranceComponent implements OnInit {

  @Input() person: PatientOverview;
  @Input() personId: string;
  
  patientBenefitPlans: BenefitPlan[];

  disableAddInsurance = false;
  showNewPatientHeader = false;
  loading = false;
  patientId = "";
  
  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-account-insurance");
    console.log(this.person);
    console.log(this.personId);
  }

}
