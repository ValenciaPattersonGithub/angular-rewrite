import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'encounters-by-carrier-migration',
  templateUrl: './encounters-by-carrier-migration.component.html',
  styleUrls: ['./encounters-by-carrier-migration.component.scss']
})
export class EncountersByCarrierMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  ofcLocation = '';
  carrier = '';
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
  constructor() { }

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.Locations && this.data.Locations.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      var isLocationChanged = false;
      var isCarrierChanged = false;
      for (var i = 0; i < this.data.Locations.length; i++) {
        if (i == 0)
            this.ofcLocation = this.data.Locations[i].Location;
        isLocationChanged = true;
        for (var j = 0; j < this.data.Locations[i].Carriers.length; j++) {
          if (j == 0)
            this.carrier = this.data.Locations[i].Carriers[j].Carrier;
          isCarrierChanged = true;
          for (var k = 0; k < this.data.Locations[i].Carriers[j].Dates.length; k++) {
            for (var l = 0; l < this.data.Locations[i].Carriers[j].Dates[k].Patients.length; l++) {
              for (var m = 0; m < this.data.Locations[i].Carriers[j].Dates[k].Patients[l].Services.length; m++) {
                element = {};
                element = angular.copy(this.data.Locations[i].Carriers[j].Dates[k].Patients[l].Services[m]);
                element['IsEncountersCarrierHeader'] = l == 0 && m == 0;
                element['Date'] = this.data.Locations[i].Carriers[j].Dates[k].Date;
                element['Patient'] = this.data.Locations[i].Carriers[j].Dates[k].Patients[l].Patient;
                element['DateOfBirth'] = this.data.Locations[i].Carriers[j].Dates[k].Patients[l].DateOfBirth;
                element['PolicyHolder'] = this.data.Locations[i].Carriers[j].Dates[k].Patients[l].PolicyHolder;
                element['PolicyHolderId'] = this.data.Locations[i].Carriers[j].Dates[k].Patients[l].PolicyHolderId;
                element['GroupNumber'] = this.data.Locations[i].Carriers[j].Dates[k].Patients[l].GroupNumber;
                element['Class'] = k % 2 == 0 ? "stripEven" : "stripOdd";
                element['IsLocationHeader'] = isLocationChanged;
                element['Location'] = this.data.Locations[i].Location;
                element['IsCarrierHeader'] = isCarrierChanged;
                element['Carrier'] = this.data.Locations[i].Carriers[j].Carrier;
                this.reportData.push(element);
                isLocationChanged = false;
                isCarrierChanged = false;
              }
            }
          }
          element = {};
          element['Carrier'] = this.data.Locations[i].Carriers[j].Carrier;
          element['CarrierTotalCharged'] = this.data.Locations[i].Carriers[j].TotalFeeCharged;
          element['CarrierTotalAllowed'] = this.data.Locations[i].Carriers[j].TotalAllowedAmount;
          element['CarrierDifference'] = this.data.Locations[i].Carriers[j].Difference;
          element['TotalCarrierPatients'] = this.data.Locations[i].Carriers[j].TotalPatients;
          element['IsFooter'] = true;
          this.reportData.push(element);
        }
        element = {};
        element['AllFeeCharged'] = this.data.Locations[i].TotalFeeCharged;
        element['AllAllowedAmount'] = this.data.Locations[i].TotalAllowedAmount;
        element['AllDifference'] = this.data.Locations[i].Difference;
        element['TotalLocationPatients'] = this.data.Locations[i].TotalPatients;
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
  name = "encountersCarrier";
  offset = 3;
  nextItem(event) {
    this.carrier = this.setCarrierHeader(this.carrier, event, this.name);
    this.previousId = event;
  }

  setCarrierHeader(carrier, rowNumber, name) {
    var rowNumber = rowNumber + 1;
    var headerDivTop = document.getElementById('headerCarrierDiv').getBoundingClientRect().top
    if ((document.getElementById('divMainInfo' + rowNumber)
      && document.getElementById('divMainInfo' + rowNumber).getBoundingClientRect().top + 30 >= headerDivTop)
      || (document.getElementById('subHeaderCarrierDiv' + rowNumber)
        && document.getElementById('subHeaderCarrierDiv' + rowNumber).getBoundingClientRect().top - 15 >= headerDivTop)) {
      carrier = document.getElementById(name + rowNumber)['value'];
    }
    return carrier;
  }
  
}
