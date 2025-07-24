import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'encounters-by-payment-migration',
  templateUrl: './encounters-by-payment-migration.component.html',
  styleUrls: ['./encounters-by-payment-migration.component.scss']
})
export class EncountersByPaymentMigrationComponent implements OnInit {

  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  ofcLocation = '';
  payment = '';
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
  constructor(public reportsHelper: ReportsHelper) { }


  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.Locations && this.data.Locations.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      var isLocationChanged = false;
      var isPaymentChanged = false;
      for (var i = 0; i < this.data.Locations.length; i++) {
        if (i == 0)
            this.ofcLocation = this.data.Locations[i].Location;
        isLocationChanged = true;
        for (var j = 0; j < this.data.Locations[i].Payments.length; j++) {
          if (j == 0)
            this.payment = this.data.Locations[i].Payments[j].Payment;
          isPaymentChanged = true;
          for (var k = 0; k < this.data.Locations[i].Payments[j].Dates.length; k++) {
            for (var l = 0; l < this.data.Locations[i].Payments[j].Dates[k].Patients.length; l++) {
              for (var m = 0; m < this.data.Locations[i].Payments[j].Dates[k].Patients[l].Services.length; m++) {
                element = {};
                element = angular.copy(this.data.Locations[i].Payments[j].Dates[k].Patients[l].Services[m]);
                element['IsEncountersPaymentHeader'] = m == 0;
                element['Date'] = this.data.Locations[i].Payments[j].Dates[k].Date;
                element['Patient'] = this.data.Locations[i].Payments[j].Dates[k].Patients[l].Patient;
                element['DateOfBirth'] = this.data.Locations[i].Payments[j].Dates[k].Patients[l].DateOfBirth;
                element['PolicyHolder'] = this.data.Locations[i].Payments[j].Dates[k].Patients[l].PolicyHolder;
                element['PolicyHolderId'] = this.data.Locations[i].Payments[j].Dates[k].Patients[l].PolicyHolderId;
                element['GroupNumber'] = this.data.Locations[i].Payments[j].Dates[k].Patients[l].GroupNumber;
                element['Class'] = k % 2 == 0 ? "stripEven" : "stripOdd";
                element['IsLocationHeader'] = isLocationChanged;
                element['Location'] = this.data.Locations[i].Location;
                element['IsPaymentHeader'] = isPaymentChanged;
                element['Payment'] = this.data.Locations[i].Payments[j].Payment;
                this.reportData.push(element);
                isLocationChanged = false;
                isPaymentChanged = false;
              }
            }
          }
          element = {};
          element['Payment'] = this.data.Locations[i].Payments[j].Payment;
          element['PaymentTotalCharged'] = this.data.Locations[i].Payments[j].TotalFeeCharged;
          element['PaymentTotalAllowed'] = this.data.Locations[i].Payments[j].TotalAllowedAmount;
          element['PaymentDifference'] = this.data.Locations[i].Payments[j].Difference;
          element['TotalPaymentPatients'] = this.data.Locations[i].Payments[j].TotalPatients;
          element['IsLocationHeader'] = isLocationChanged;
          element['Location'] = this.data.Locations[i].Location;
          element['IsFooter'] = true;
          this.reportData.push(element);
        }
        element = {};
        element['AllFeeCharged'] = this.data.Locations[i].TotalFeeCharged;
        element['AllAllowedAmount'] = this.data.Locations[i].TotalAllowedAmount;
        element['AllDifference'] = this.data.Locations[i].Difference;
        element['TotalLocationPatients'] = this.data.Locations[i].TotalPatients;
        element['IsLocationHeader'] = isLocationChanged;
        element['Location'] = this.data.Locations[i].Location;
        element['IsLocationFooter'] = true;
        this.reportData.push(element);
      }
      element = {};
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
  name = "encountersPayment";
  offset = 2;
  nextItem(event) {
    var txt = this.reportsHelper.setLocationHeaderV2(this.payment, event, this.previousId, this.name, 'headerLocationDiv', 'subHeaderPaymentDiv', 'paymentTotalDiv', this.offset);
    this.payment = txt && txt.length > 0 ? txt : this.payment;
    this.previousId = event;
  }
 
  nextBatch(event) {
      this.ofcLocation = this.reportsHelper.setLocationHeaderV1(this.ofcLocation, event, this.previousId, this.name, this.offset);
    this.previousId = event;
  }
  
}
