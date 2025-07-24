import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'patient-account-portion',
  templateUrl: './patient-account-portion.component.html',
  styleUrls: ['./patient-account-portion.component.scss']
})
export class PatientAccountPortionComponent implements OnInit {

  @Input() disablePayments: boolean;
  @Input() patientPortion: number;
  @Input() patientPortionLoading: boolean;
  @Input() paymentFunction: () => void

  loading = false;

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("patient-account-portion");
    console.log(this.patientPortion);
    console.log(this.disablePayments);
    console.log(this.patientPortionLoading);
    console.log(this.paymentFunction);
  }

}
