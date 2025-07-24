import { Component, OnInit, Input } from '@angular/core';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'proposed-treatment-migration',
  templateUrl: './proposed-treatment-migration.component.html',
  styleUrls: ['./proposed-treatment-migration.component.scss']
})
export class ProposedTreatmentMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  IsFooter = false;
  ofcLocation = '';
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
        element = {};
        element["LocationHeader"] = this.data.Locations[i].Location;
        element["IsLocationHeader"] = true;
        this.reportData.push(element);
        for (var j = 0; j < this.data.Locations[i].Patients.length; j++) {
          element = {};
          element["Patient"] = this.data.Locations[i].Patients[j].Patient;
          element["IsPatientHeader"] = true;
          element["LocationHeader"] = this.data.Locations[i].Location;
          this.reportData.push(element);
          for (var l = 0; l < this.data.Locations[i].Patients[j].Plans.length; l++) {
            for (var m = 0; m < this.data.Locations[i].Patients[j].Plans[l].Services.length; m++) {
              element = {};
              element = angular.copy(this.data.Locations[i].Patients[j].Plans[l].Services[m]);
              element["DateProposed"] = this.data.Locations[i].Patients[j].Plans[l].DateProposed;
              element["TreatmentPlan"] = this.data.Locations[i].Patients[j].Plans[l].TreatmentPlan;
              element["IsFirst"] = m == 0;
              element['IsFooter'] = false;
              element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
              element["LocationHeader"] = this.data.Locations[i].Location;
              this.reportData.push(element);
            }
          }
          element = {};
          element["Patient"] = this.data.Locations[i].Patients[j].Patient;
          element["PatientAmount"] = this.data.Locations[i].Patients[j].Amount;
          element["PatientNumberOfServices"] = this.data.Locations[i].Patients[j].NumberOfServices;
          element["IsSubFooter"] = true;
          element["LocationHeader"] = this.data.Locations[i].Location;
          this.reportData.push(element);
        }
        element = {};
        element['Class'] = i % 2 == 0 ? "stripEven" : "stripOdd";
        element['Location'] = this.data.Locations[i].Location;
        element['LocationAmount'] = this.data.Locations[i].Amount;
        element['LocationNumberOfServices'] = this.data.Locations[i].NumberOfServices;
        element['IsLocationSubFooter'] = true;
        element["LocationHeader"] = this.data.Locations[i].Location;
        this.reportData.push(element);
      }
      element = {};
      element['IsFooter'] = true;
      this.reportData.push(element);
      this.data.totalRecords = this.reportData.length;
      this.isDataLoaded = true;
    }
  }

  ngOnChanges() {
    this.refreshData();
  }

  previousId = -1;
  name = "proposedTreatment";
  offset = 3.5;
  nextItem(event) {
      this.ofcLocation = this.reportsHelper.setLocationHeaderV1(this.ofcLocation, event, this.previousId, this.name, this.offset);
    this.previousId = event;
  }

}
