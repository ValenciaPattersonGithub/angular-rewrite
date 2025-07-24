import { Component, Input, OnInit } from '@angular/core';
import { GraphData } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'patient-account-aging',
  templateUrl: './patient-account-aging.component.html',
  styleUrls: ['./patient-account-aging.component.scss']
})
export class PatientAccountAgingComponent implements OnInit {
  //ToDo: Check If data is requried as we are passing graphData object 
  @Input() data: number; 
  @Input() graphData: GraphData;
  @Input() graphId: number;

  chartId: number;
  chartHeight: number;
  totalAmount: number;
  moreThanNintyBalance: number;
  moreThanSixtyBalance: number;


  constructor() { }

  ngOnInit(): void {
    //ToDo:Remove While Migration
    console.log("patient-account-aging");
    console.log(this.data);
    console.log(this.graphData);
    console.log(this.graphId);
  }

}
