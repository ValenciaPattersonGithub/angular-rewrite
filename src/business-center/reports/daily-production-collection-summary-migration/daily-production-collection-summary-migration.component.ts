import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;


@Component({
  selector: 'daily-production-collection-summary-migration',
  templateUrl: './daily-production-collection-summary-migration.component.html',
  styleUrls: ['./daily-production-collection-summary-migration.component.scss']
})
export class DailyProductionCollectionSummaryMigrationComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
  pagesize = 50;
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  ofcLocation = '';
  constructor(public reportsHelper: ReportsHelper) { }

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.Locations && this.data.Locations.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      var isLocationChanged = false;
      var className = "";
      for (var i = 0; i < this.data.Locations.length; i++) {
        if (i == 0)
            this.ofcLocation = this.data.Locations[i].Location;
        isLocationChanged = true;
        for (var j = 0; j < this.data.Locations[i].Dates.length; j++) {
          element = angular.copy(this.data.Locations[i].Dates[j]);
          element['IsFooter'] = false;
          className = j % 2 == 0 ? "stripEven" : "stripOdd";
          element['Class'] = className;
          element['Location'] = this.data.Locations[i].Location;
          if (j == 0) {
            element['IsLocationHeader'] = isLocationChanged;
            isLocationChanged = false;
          }
          this.reportData.push(element);
        }
        element = {};
        element['Location'] = this.data.Locations[i].Location;
        element['IsFooter'] = true;
        element['Class'] = className;
        element['Production'] = this.data.Locations[i].Production;
        element['Collections'] = this.data.Locations[i].Collections;
        element['Adjustments'] = this.data.Locations[i].Adjustments;
 
        this.reportData.push(element);
      }
      element = {};
      element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
      element['IsReportTotals'] = true;
      element['TotalProduction'] = this.data.TotalProduction;
      element['TotalCollections'] = this.data.TotalCollections;
      element['TotalAdjustments'] = this.data.TotalAdjustments;
      this.reportData.push(element);
      this.data.totalRecords = this.reportData.length;
      this.isDataLoaded = true;
    }
  }
  ngOnChanges() {
    this.refreshData();
  }

  previousId = -1;

  name = 'prodcollectionsummary';

  nextItem(event) {
      this.ofcLocation = this.reportsHelper.setLocationHeader(this.ofcLocation, event, this.name);
  }
}
