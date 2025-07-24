import { Component, Input, OnInit } from '@angular/core';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'projected-net-production-migration',
  templateUrl: './projected-production-migration.component.html',
  styleUrls: ['./projected-production-migration.component.scss']
})
export class ProjectedNetProductionMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any=[];
  isDataLoaded = false;
  ofcLocation = "";
  constructor(public reportsHelper: ReportsHelper) { }

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.Locations && this.data.Locations.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      for (var i = 0; i < this.data.Locations.length; i++) {
        if (i == 0)
            this.ofcLocation = this.data.Locations[i].Location;
        for (var j = 0; j < this.data.Locations[i].Providers.length; j++) {
          element = {};
          if (j == 0) {
            element['IsLocationHeader'] = true;
          }
          element["Class"] = j % 2 == 0 ? "stripEven" : "stripOdd";
          element["Provider"] = this.data.Locations[i].Providers[j].Provider;
          element["Location"] = this.data.Locations[i].Location;
          element["IsProviderRow"] = true;
          this.reportData.push(element);
          for (var k = 0; k < this.data.Locations[i].Providers[j].Appointments.length; k++) {
            element = angular.copy(this.data.Locations[i].Providers[j].Appointments[k]);
            element["IsDetailRow"] = true;
            element["Location"] = this.data.Locations[i].Location;
            element["Class"] = j % 2 == 0 ? "stripEven" : "stripOdd";
            this.reportData.push(element);
          }
          element = {};
          element["Class"] = j % 2 == 0 ? "stripEven" : "stripOdd";
          element["Location"] = this.data.Locations[i].Location;
          element["NumberOfAppointments"] = this.data.Locations[i].Providers[j].NumberOfAppointments;
          element["Footer1"] = true;
          this.reportData.push(element);
          
          element = {};
          element["Class"] = j % 2 == 0 ? "stripEven" : "stripOdd";
          element["Location"] = this.data.Locations[i].Location;
          element["NumberOfAppointmentsNoProduction"] = this.data.Locations[i].Providers[j].NumberOfAppointmentsNoProduction;
          element["Footer2"] = true;
          this.reportData.push(element);

          element = {};
          element["Class"] = j % 2 == 0 ? "stripEven" : "stripOdd";
          element["Location"] = this.data.Locations[i].Location;
          element["ScheduledServicesProjectedProduction"] = this.data.Locations[i].Providers[j].ScheduledServicesProjectedProduction;
          element["Footer3"] = true;
          this.reportData.push(element);
          
          element = {};
          element["Class"] = j % 2 == 0 ? "stripEven" : "stripOdd";
          element["Location"] = this.data.Locations[i].Location;
          element["AppointmentTypeProjectedProduction"] = this.data.Locations[i].Providers[j].AppointmentTypeProjectedProduction;
          element["Footer4"] = true;
          this.reportData.push(element);
         
          element = {};
          element["Location"] = this.data.Locations[i].Location;
          element["Class"] = j % 2 == 0 ? "stripEven" : "stripOdd";
          element["TotalProjectedNetProduction"] = this.data.Locations[i].Providers[j].TotalProjectedNetProduction;
          element["IsLocationTotal"] = false;
          element["Footer5"] = true;
          this.reportData.push(element);
        }
       
        this.reportData[this.reportData.length - 1]["IsLocationTotal"] = true;
  
      }
      element = {};
      // element["Location"] = this.data.Locations[i].Location;
      element["IsLocationTotal"] = false;
      element["NumberOfAppointments"] = this.data.NumberOfAppointments;
      element["NumberOfAppointmentsNoProduction"] = this.data.NumberOfAppointmentsNoProduction;
      element["ScheduledServicesProjectedProduction"] = this.data.ScheduledServicesProjectedProduction;
      element["AppointmentTypeProjectedProduction"] = this.data.AppointmentTypeProjectedProduction;
      element["TotalProjectedNetProduction"] = this.data.TotalProjectedNetProduction;
      element["IsReportTotals"] = true;
      this.reportData.push(element);
      this.isDataLoaded = true;
    }

  }

  ngOnChanges() {
    this.reportData = [];
    this.refreshData();
  }
  viousId = -1;
  name = "projectednetproductionLocation";
  offset = 3;
  previousId = 0;
  nextBatch(event) { 
      this.ofcLocation = this.reportsHelper.setLocationHeaderV1(this.ofcLocation, event, this.previousId, this.name, this.offset);
    this.previousId = event;
  }
}
