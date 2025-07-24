import { Component, Input, OnInit } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'potential-duplicate-patients-migration',
  templateUrl: './potential-duplicate-patients-migration.component.html',
  styleUrls: ['./potential-duplicate-patients-migration.component.scss']
})
export class PotentialDuplicatePatientsMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  constructor() { }

  ngOnInit(): void {
  }

  refreshData() {
    if (this.data && this.data.Patients && this.data.Patients.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      for (var i = 0; i < this.data.Patients.length; i++) {
        for (var j = 0; j < this.data.Patients[i].Patients.length; j++) {
          element = angular.copy(this.data.Patients[i].Patients[j]);
          element['Class'] = this.data.Patients[i].Patients[j].RowNumber % 2 == 0 ? "stripOdd" : "stripEven";
          this.reportData.push(element);
        }

      }
      this.data.totalRecords = this.reportData.length;
      this.isDataLoaded = true;
    }

  }

  ngOnChanges() {
    this.refreshData();
  }
}
