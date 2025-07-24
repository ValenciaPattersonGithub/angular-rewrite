import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'payment-reconciliation-migration',
  templateUrl: './payment-reconciliation-migration.component.html',
  styleUrls: ['./payment-reconciliation-migration.component.scss']
})
export class PaymentReconciliationMigrationComponent implements OnInit {
  ofcLocation = '';
  constructor(public reportsHelper: ReportsHelper) { }
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;

  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
 
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
      
        for (var j = 0; j < this.data.Locations[i].PaymentTypes.length; j++) {
          if (!this.data.isSummaryView) {
            for (var k = 0; k < this.data.Locations[i].PaymentTypes[j].Payments.length; k++) {
              element = angular.copy(this.data.Locations[i].PaymentTypes[j].Payments[k]);
              element['IsFooter'] = false;
              element['IsDistributed'] = false;
              element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
              element['Location'] = this.data.Locations[i].Location;
              if (j == 0) {
                element['IsLocationHeader'] = isLocationChanged;
                isLocationChanged = false;
              }
              element['IsPaymentTypeHeader'] = k == 0;
              element['PaymentType'] = this.data.Locations[i].PaymentTypes[j].PaymentType;
              this.reportData.push(element);
              for (var l = 0; l < this.data.Locations[i].PaymentTypes[j].Payments[k].DistributedAmounts.length; l++) {
                element = angular.copy(this.data.Locations[i].PaymentTypes[j].Payments[k].DistributedAmounts[l]);
                element['IsDistributed'] = true;
                element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
                element['Location'] = this.data.Locations[i].Location;
                this.reportData.push(element);
              }
            }
          }
       
          element = {};
          if (this.data.isSummaryView) {
            element['Location'] = this.data.Locations[i].Location;
            element['IsLocationHeader'] = isLocationChanged;
            isLocationChanged = false;
          }
          element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
          element['PaymentType'] = this.data.Locations[i].PaymentTypes[j].PaymentType;
          element['PaymentTypeTotal'] = this.data.Locations[i].PaymentTypes[j].Amount;
          element['IsFooter'] = true;
          this.reportData.push(element);
        }
        element = {};
        element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
        element['Location'] = this.data.Locations[i].Location;
        element['LocationTotals'] = this.data.Locations[i].Amount;
        element['IsLocationFooter'] = true;
        this.reportData.push(element);
      }
      element = {};
      element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
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
  name = "paymentReconLocation";
  offset = 3;
  nextBatch(event) {
      this.ofcLocation = this.reportsHelper.setLocationHeaderV1(this.ofcLocation, event, this.previousId, this.name, this.offset);
    this.previousId = event;
  }
}
