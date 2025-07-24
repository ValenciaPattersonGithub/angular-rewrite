import { Component, OnInit,Input,ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'referral-sources-productivity-detailed-migration',
  templateUrl: './referral-sources-productivity-detailed-migration.component.html',
  styleUrls: ['./referral-sources-productivity-detailed-migration.component.scss']
})
export class ReferralSourcesProductivityDetailedMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
  ofcLocation = '';
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
  constructor(public reportsHelper: ReportsHelper) { }

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.Locations && this.data.Locations.length > 0){
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      var isLocationChanged = false;
      for (var i = 0; i < this.data.Locations.length; i++) {
        if (i == 0)
            this.ofcLocation = this.data.Locations[i].Location;
        isLocationChanged = true;
         for (var j = 0; j < this.data.Locations[i].Sources.length; j++) {
           for (var k = 0; k < this.data.Locations[i].Sources[j].Patients.length; k++) {
            
             if (k == 0) {
               element = {};
               element = angular.copy(this.data.Locations[i].Sources[j].Patients[k]);
               element['IsReferralSourceHeader'] = true;
               element['ReferralSource'] = this.data.Locations[i].Sources[j].ReferralSource;
               element['Location'] = this.data.Locations[i].Location;
               element['IsLocationHeader'] = isLocationChanged;
               isLocationChanged = false;
               element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
               this.reportData.push(element);
             }
             
             element = {};
             element = angular.copy(this.data.Locations[i].Sources[j].Patients[k]);
             element['IsReferralSourceHeader'] = false;
             element['ReferralSource'] = this.data.Locations[i].Sources[j].ReferralSource;
             element['RangeSelected'] = this.data.Locations[i].Sources[j].Patients[k].RangeSelected;
             element['ThisMonth'] = this.data.Locations[i].Sources[j].Patients[k].ThisMonth;
             element['ThisYear'] = this.data.Locations[i].Sources[j].Patients[k].ThisYear;
             element['IsFooter'] = false;
             element['ReferenceSourceRangeSelectedTotal'] = this.data.Locations[i].Sources[j].RangeSelected;
             element['ReferenceSourceThisMonthTotal'] = this.data.Locations[i].Sources[j].ThisMonth;
             element['ReferenceSourceThisYearTotal'] = this.data.Locations[i].Sources[j].ThisYear;
             element['Location'] = this.data.Locations[i].Location;
             element['IsLocationHeader'] = false;
             element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
             this.reportData.push(element);


            if (this.data.Locations[i].Sources[j].Patients.length - 1 == k) {
              element = {};
              element = angular.copy(this.data.Locations[i].Sources[j].Patients[k]);
              element['IsReferralSourceHeader'] = false;
              element['ReferralSource'] = this.data.Locations[i].Sources[j].ReferralSource;
              element['IsFooter'] = this.data.Locations[i].Sources[j].Patients.length - 1 == k;
              element['ReferenceSourceRangeSelectedTotal'] = this.data.Locations[i].Sources[j].RangeSelected;
              element['ReferenceSourceThisMonthTotal'] = this.data.Locations[i].Sources[j].ThisMonth;
              element['ReferenceSourceThisYearTotal'] = this.data.Locations[i].Sources[j].ThisYear;
              element['Location'] = this.data.Locations[i].Location;
              element['IsLocationHeader'] = false;
              element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
              this.reportData.push(element);
            }
          }
        }
        element = {};
        element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
        element['Location'] = this.data.Locations[i].Location;
        element['LocationRangeSelectedTotals'] = this.data.Locations[i].RangeSelected;
        element['LocationThisMonthTotals'] = this.data.Locations[i].ThisMonth;
        element['LocationThisYearTotals'] = this.data.Locations[i].ThisYear;
        element['IsLocationFooter'] = true;
        this.reportData.push(element);
      }
      element = {};
      element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
      element['ReportTotals'] = this.data.ThisYear;
      element['IsReportTotals'] = true;
      this.reportData.push(element);
      this.data.totalRecords = this.reportData.length;
      this.isDataLoaded = true;
    }
    
  }
  ngOnChanges() {
    this.refreshData();
   }
  previousId = -1;
  offset = 3;
  name = "referralSourcesLocation";
  nextItem(event) {
      this.ofcLocation = this.reportsHelper.setLocationHeaderV1(this.ofcLocation, event, this.previousId, this.name, this.offset);
    this.previousId = event;
  }
}
