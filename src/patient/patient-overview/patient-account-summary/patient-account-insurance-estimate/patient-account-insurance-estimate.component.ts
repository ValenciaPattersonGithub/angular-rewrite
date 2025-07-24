import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'patient-account-insurance-estimate',
  templateUrl: './patient-account-insurance-estimate.component.html',
  styleUrls: ['./patient-account-insurance-estimate.component.scss']
})
export class PatientAccountInsuranceEstimateComponent implements OnInit {

  @Input() insEstimateLoading: boolean;
  @Input() disablePayments: boolean;
  @Input() insuranceEstimate: boolean;
  @Input() paymentFunction: () => void;

  soarAuthInsPaymentViewKey = "";
  hasPatientInsurancePaymentViewAccess = false;
  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-account-insurance-estimate");
    console.log(this.insEstimateLoading);
    console.log(this.disablePayments);
    console.log(this.insuranceEstimate);
    console.log(this.paymentFunction);
  }

}
