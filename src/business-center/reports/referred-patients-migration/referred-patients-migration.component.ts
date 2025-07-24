import { Component, Input, OnInit } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'referred-patients-migration',
  templateUrl: './referred-patients-migration.component.html',
  styleUrls: ['./referred-patients-migration.component.scss']
})
export class ReferredPatientsMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  constructor() { }

  ngOnInit(): void {
  }

  refreshData() {
    if (this.data && this.data.ReferralTypes && this.data.ReferralTypes.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      for (var i = 0; i < this.data.ReferralTypes.length; i++) {
        for (var j = 0; j < this.data.ReferralTypes[i].ReferralSources.length; j++) {
          for (var k = 0; k < this.data.ReferralTypes[i].ReferralSources[j].Patients.length; k++) {
            element = angular.copy(this.data.ReferralTypes[i].ReferralSources[j].Patients[k]);
            element['IsFooter'] = false;
            element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
            if (j == 0 && k == 0) {
              element['ReferralType'] = this.data.ReferralTypes[i].ReferralType;
              element['IsReferralTypeHeader'] = true;
            }
            if (k == 0) {
              element['ReferralSource'] = this.data.ReferralTypes[i].ReferralSources[j].ReferralSource;
              element['IsReferralSourceHeader'] = true;
            }
            this.reportData.push(element);
          }
          element = {};
          element['IsFooter'] = true;
          element['TotalReferral'] = this.data.ReferralTypes[i].ReferralSources[j].Patients.length;
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
