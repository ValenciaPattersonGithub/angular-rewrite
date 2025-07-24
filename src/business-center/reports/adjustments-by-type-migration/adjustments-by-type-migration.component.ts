import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";

declare var angular: angular.IAngularStatic;
import { ReportsHelper } from '../reports-helper';

@Component({
  selector: 'adjustments-by-type-migration',
  templateUrl: './adjustments-by-type-migration.component.html',
  styleUrls: ['./adjustments-by-type-migration.component.scss']
})
export class AdjustmentsByTypeMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  ofcLocation = '';
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;

  //constructor(public reportsHelper: ReportsHelper) { }
 constructor(
    public reportsHelper: ReportsHelper ,  
    private matIconRegistry: MatIconRegistry,
     private domSanitizer: DomSanitizer) {
     this.matIconRegistry.addSvgIcon(
         'assignment',
         this.domSanitizer.bypassSecurityTrustResourceUrl(
             '../v1.0/images/assignment.svg'
         )
     );
 }
  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.Locations && this.data.Locations.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      var isLocationChanged = false;
      for (var i = 0; i < this.data.Locations.length; i++) {
        if (i == 0)
            this.ofcLocation = this.data.Locations[i].Location;
        isLocationChanged = true;
        for (var j = 0; j < this.data.Locations[i].AdjustmentTypes.length; j++) {
          if (this.data.isSummaryView) {
            element = angular.copy(this.data.Locations[i].AdjustmentTypes[j]);
            element['IsDataRecord'] = true;
            element['AdjustmentTypeTotal'] = this.data.Locations[i].AdjustmentTypes[j].Amount;
            element['Location'] = this.data.Locations[i].Location;
            element['IsAdjustmentTypeHeader'] = true;
            element['IsFooter'] = false;
            element['IsLocationHeader'] = isLocationChanged;
            isLocationChanged = false;
            element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
            this.reportData.push(element);

            element = {};
            element = angular.copy(this.data.Locations[i].AdjustmentTypes[j]);
            element['AdjustmentTypeTotal'] = this.data.Locations[i].AdjustmentTypes[j].Amount;
            element['Location'] = this.data.Locations[i].Location;
            element['IsAdjustmentTypeHeader'] = false;
            element['IsFooter'] = true;
            element['IsLocationHeader'] = isLocationChanged;
            element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
            this.reportData.push(element);

            element = {};
            element = angular.copy(this.data.Locations[i].AdjustmentTypes[j]);
            element['AdjustmentTypeTotal'] = this.data.Locations[i].AdjustmentTypes[j].Amount;
            element['Location'] = this.data.Locations[i].Location;
            element['IsAdjustmentTypeHeader'] = false;
            element['IsFooter1'] = true;
            element['IsLocationHeader'] = isLocationChanged;
            element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
            this.reportData.push(element);

          }
          for (var k = 0; k < this.data.Locations[i].AdjustmentTypes[j].Dates.length; k++) {

            for (var l = 0; l < this.data.Locations[i].AdjustmentTypes[j].Dates[k].AdjustmentRecords.length; l++) {
              element = {};
              element = angular.copy(this.data.Locations[i].AdjustmentTypes[j].Dates[k].AdjustmentRecords[l]);
              if (k == 0 && l == 0) { 
                element['IsAdjustmentTypeHeader'] = k == 0 && l == 0;
                element['AdjustmentType'] = this.data.Locations[i].AdjustmentTypes[j].AdjustmentType;
                element['PositiveNegative'] = this.data.Locations[i].AdjustmentTypes[j].PositiveNegative;
                element['Impaction'] = this.data.Locations[i].AdjustmentTypes[j].Impaction;
                element['AdjustmentTypeTotal'] = this.data.Locations[i].AdjustmentTypes[j].Amount;
                element['AdjustmentCount'] = this.data.Locations[i].AdjustmentTypes[j].AdjustmentCount;
                element['IsFooter'] = false;
                this.reportData.push(element);
                element['IsLocationHeader'] = isLocationChanged;
                element['Location'] = this.data.Locations[i].Location;
                element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
                isLocationChanged = false;
              }

              element = {};
              element = angular.copy(this.data.Locations[i].AdjustmentTypes[j].Dates[k].AdjustmentRecords[l]);
              element['IsAdjustmentTypeHeader'] = false;
              element['IsDataRecord'] = true;
              element['AdjustmentType'] = this.data.Locations[i].AdjustmentTypes[j].AdjustmentType;
              element['PositiveNegative'] = this.data.Locations[i].AdjustmentTypes[j].PositiveNegative;
              element['Impaction'] = this.data.Locations[i].AdjustmentTypes[j].Impaction;
              element['AdjustmentTypeTotal'] = this.data.Locations[i].AdjustmentTypes[j].Amount;
              element['AdjustmentCount'] = this.data.Locations[i].AdjustmentTypes[j].AdjustmentCount;
              if (l == 0)
                element['Date'] = this.data.Locations[i].AdjustmentTypes[j].Dates[k].Date;
              element['IsFooter'] = false;
              element['Location'] = this.data.Locations[i].Location;
              element['IsLocationHeader'] = isLocationChanged;
              element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
              this.reportData.push(element);

              if (this.data.Locations[i].AdjustmentTypes[j].Dates.length - 1 == k && this.data.Locations[i].AdjustmentTypes[j].Dates[k].AdjustmentRecords.length - 1 == l) {
                element = {};
                element = angular.copy(this.data.Locations[i].AdjustmentTypes[j].Dates[k].AdjustmentRecords[l]);
                element['IsAdjustmentTypeHeader'] = false;
                element['AdjustmentType'] = this.data.Locations[i].AdjustmentTypes[j].AdjustmentType;
                element['AdjustmentTypeTotal'] = this.data.Locations[i].AdjustmentTypes[j].Amount;
                if (l == 0)
                  element['Date'] = this.data.Locations[i].AdjustmentTypes[j].Dates[k].Date;
                element['IsLocationHeader'] = isLocationChanged;
                element['Location'] = this.data.Locations[i].Location;
                element['IsFooter'] = true;
                element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
                this.reportData.push(element);

                element = {};
                element = angular.copy(this.data.Locations[i].AdjustmentTypes[j].Dates[k].AdjustmentRecords[l]);
                element['IsAdjustmentTypeHeader'] = false;
                element['AdjustmentCount'] = this.data.Locations[i].AdjustmentTypes[j].AdjustmentCount;
                if (l == 0)
                  element['Date'] = this.data.Locations[i].AdjustmentTypes[j].Dates[k].Date;
                element['IsLocationHeader'] = isLocationChanged;
                element['Location'] = this.data.Locations[i].Location;
                element['IsFooter1'] = true;
                element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
                this.reportData.push(element);
              }
            }
          }
        }
        element = {};
        element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
        element['Location'] = this.data.Locations[i].Location;
        element['LocationTotals'] = this.data.Locations[i].Amount;
        element['IsLocationFooter'] = true;
        this.reportData.push(element);
      }
      element = {};
      element['Class'] = j % 2 == 0 ? "stripEven" : "stripOdd";
      element['ReportTotals'] = this.data.Amount;
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
  name = "adjustmentsTypeLocation";
  offset = 3;
  nextItem(event) {
      this.ofcLocation = this.reportsHelper.setLocationHeaderV1(this.ofcLocation, event, this.previousId, this.name, this.offset);
    this.previousId = event;
  }
}
