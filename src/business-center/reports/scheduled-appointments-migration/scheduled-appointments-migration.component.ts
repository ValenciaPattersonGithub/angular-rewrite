import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ReportsHelper } from '../reports-helper';
declare var angular: angular.IAngularStatic;

@Component({
  selector: 'scheduled-appointments-migration',
  templateUrl: './scheduled-appointments-migration.component.html',
  styleUrls: ['./scheduled-appointments-migration.component.scss']
})
export class ScheduledAppointmentsMigrationComponent implements OnInit {
  @Input() data: any;
  reportData: any = [];
  isDataLoaded = false;
  ofcLocation = '';
  date = '';
  @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;
  constructor(public reportsHelper: ReportsHelper) { }

  ngOnInit(): void {
  }
  refreshData() {
    if (this.data && this.data.Appointments && this.data.Appointments.length > 0) {
      this.isDataLoaded = false;
      this.reportData = [];
      var element = {};
      for (var i = 0; i < this.data.Appointments.length; i++) {
        element = {};
        element["Date"] = this.data.Appointments[i].Date;
        element["Location"] = this.data.Appointments[i].Location;
        element["IsHeader"] = true;
        element["IsDate"] = true;
        element["IsLocation"] = true;
        this.reportData.push(element);

        element = {};
        element["IsSubHeader"] = true;
        this.reportData.push(element);

        if (i == 0) {
            this.ofcLocation = this.data.Appointments[i].Location;
          this.date = this.data.Appointments[i].Date;
        }

        for (var j = 0; j < this.data.Appointments[i].Plans.length; j++) {
          element = {};
          element = angular.copy(this.data.Appointments[i].Plans[j]);
          element["IsPlan"] = true;
          element["Location"] = this.data.Appointments[i].Location;
          element["Date"] = this.data.Appointments[i].Date;
          element["Patient"] = this.data.Appointments[i].Patient;
          element["IsPatient"] = j == 0;
          element["DateOfBirth"] = this.data.Appointments[i].DateOfBirth;
          element["IsDOB"] = j == 1;
          element["ApptPhoneNumber"] = this.data.Appointments[i].PhoneNumber;
          element["IsPhoneNumber"] = j == 2;
          this.reportData.push(element);
        }
        var cntr = 3 - this.data.Appointments[i].Plans.length;
        while (cntr > 0) {
          element = {};
          element["IsPlan"] = true;
          if (cntr == 1) {
            element["ApptPhoneNumber"] = this.data.Appointments[i].PhoneNumber;
            element["IsPhoneNumber"] = true;
          }
          else if (cntr == 2) {
            element["DateOfBirth"] = this.data.Appointments[i].DateOfBirth;
            element["IsDOB"] = true;
          }
          else {
            element["Patient"] = this.data.Appointments[i].Patient;
            element["IsPatient"] = true;
          }
          element["Location"] = this.data.Appointments[i].Location;
          element["Date"] = this.data.Appointments[i].Date;
          cntr--;
          this.reportData.push(element);
        }

        element = angular.copy(this.data.Appointments[i]);
        element["Plans"] = {};
        element["IsApptInfo"] = true;
        element["Location"] = this.data.Appointments[i].Location;
        element["Date"] = this.data.Appointments[i].Date;
        this.reportData.push(element);
        for (var k = 0; k < this.data.Appointments[i].Codes.length; k++) {
          element = angular.copy(this.data.Appointments[i].Codes[k]);
          element["IsCode"] = true;
          element["Location"] = this.data.Appointments[i].Location;
          element["Date"] = this.data.Appointments[i].Date;
          this.reportData.push(element);
        }
        element = {};
        element["Note"] = this.data.Appointments[i].Note;
        element["IsNote"] = true;
        element["Location"] = this.data.Appointments[i].Location;
        element["Date"] = this.data.Appointments[i].Date;
        this.reportData.push(element);
      }
      this.isDataLoaded = true;
    }
  }
  ngOnChanges() {
    this.refreshData();
  }
  locDivname = "scheduledAppointmentsLocation";
  dateDivname = "scheduledAppointmentsDate";
  nextItem(event) {
      this.ofcLocation = this.reportsHelper.setLocationHeader(this.ofcLocation, event, this.locDivname);
    this.date = this.reportsHelper.setDateHeader(this.date, event, this.dateDivname);
  }

}
