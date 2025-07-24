import { Component, OnInit,Input,ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'receivables-by-account-migration',
  templateUrl: './receivables-by-account-migration.component.html',
  styleUrls: ['./receivables-by-account-migration.component.scss']
})
export class ReceivablesByAccountMigrationComponent implements OnInit {

  constructor(public reportsHelper: ReportsHelper) { }
  ofcLocation = '';

  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
  ngOnInit(): void {
  }

  refreshData() {
    if (this.data && this.data.Locations && this.data.Locations.length > 0) {
      if (!this.data.isSummaryView)
        this.data.isSummaryView = false;
      this.isDataLoaded = false;
      var element = {};
      for (var i = 0; i < this.data.Locations.length; i++) {
        if (i == 0)
            this.ofcLocation = this.data.Locations[i].LocationName;
        for (var j = 0; j < this.data.Locations[i].ResponsibleParties.length; j++) {
          element = angular.copy(this.data.Locations[i].ResponsibleParties[j]);
          if (j == 0)
            element['IsLocationHeader'] = true;
          element['Location'] = this.data.Locations[i].LocationName;
          element['IsLocationTotal'] = false;
          element['IsRow'] = true;

          element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
          this.reportData.push(element);
        }
        element = {};
        element['Location'] = this.data.Locations[i].LocationName;
        element['ThirtyDays'] = this.data.Locations[i].ThirtyDays;
        element['SixtyDays'] = this.data.Locations[i].SixtyDays;
        element['NinetyDays'] = this.data.Locations[i].NinetyDays;
        element['MoreThanNinetyDays'] = this.data.Locations[i].MoreThanNinetyDays;
        element['InCollection'] = this.data.Locations[i].InCollection;
        element['TotalAccountBalance'] = this.data.Locations[i].TotalAccountBalance;
        element['TotalEstInsurance'] = this.data.Locations[i].TotalEstInsurance;
        element['TotalEstInsuranceAdjustment'] = this.data.Locations[i].TotalEstInsuranceAdjustment;
        element['TotalPatientPortion'] = this.data.Locations[i].TotalPatientPortion;
        element['IsLocationTotal'] = true;
        this.reportData.push(element);
      }
      element = {};
      element['IsLocationTotal'] = false;
      element['IsReportTotals'] = true;
      element['ThirtyDays'] = this.data.ThirtyDays;
      element['SixtyDays'] = this.data.SixtyDays;
      element['NinetyDays'] = this.data.NinetyDays;
      element['MoreThanNinetyDays'] = this.data.MoreThanNinetyDays;
      element['InCollection'] = this.data.InCollection;
      element['TotalAccountBalance'] = this.data.TotalAccountBalance;
      element['TotalEstInsurance'] = this.data.TotalEstInsurance;
      element['TotalEstInsuranceAdjustment'] = this.data.TotalEstInsuranceAdjustment;
      element['TotalPatientPortion'] = this.data.TotalPatientPortion;
      this.reportData.push(element);
      this.data.totalRecords = this.reportData.length;
      this.isDataLoaded = true;
    }
  }
  
  ngOnChanges() {
    this.reportData = [];
    this.refreshData();
  }
  previousId = -1;
  name = 'receviablesbyAccountLocation';
  offset = 2;
  nextItem(event) {
      this.ofcLocation = this.reportsHelper.setLocationHeaderV1(this.ofcLocation, event, this.previousId, this.name, this.offset);
    this.previousId = event;
  }
}
