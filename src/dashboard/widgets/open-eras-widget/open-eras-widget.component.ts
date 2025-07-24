import { Component, OnInit, Input, Inject } from '@angular/core';
import { DashboardWidgetService } from '../services/dashboard-widget.service';
@Component({
  selector: 'open-eras-widget',
  templateUrl: './open-eras-widget.component.html',
  styleUrls: ['./open-eras-widget.component.scss']
})
export class OpenERAsWidgetComponent implements OnInit {
  loader: boolean;
  @Input() widgetData;
  openEras;
  totalEras;
  locationEnrolledInEra;
  userLocation;
  callMethods = true;
  constructor(
    @Inject('locationService') private locationService,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('LocationServices') private locationServices,
    private dashboardWidgetService: DashboardWidgetService
  ) {

  }
  createFilterDto(dateOption, locations, providers, startDate, endDate) {
    let filters = {};
    filters['LocationIds'] = locations;
    filters['DateOption'] = dateOption;
    filters['ProviderIds'] = providers;
    filters['StartDate'] = startDate;
    filters['EndDate'] = endDate;
    filters['optionVal'] = 1;
    return filters;
  }

  // get era data
  getWidgetDetails() {
    this.loader = true;
    const filterResult = this.createFilterDto(null, [this.userLocation.id], null, null, null);
    this.dashboardWidgetService.getWidgetData(this.widgetData.RouteUrl, filterResult).subscribe((res: any) => {
      if (res.Value) {
          this.openEras = res.Value.OpenEras; // if it is 0 then show the no data message
          this.totalEras = res.Value.TotalAmountEras;
      }
      this.loader = false;
    });
  }

  // check the enrolled era
  checkLoc() {
    this.loader = true;
    this.locationServices.getLocationEraEnrollmentStatus({locationId: this.userLocation.id})
    .$promise.then((res) => {
      this.locationEnrolledInEra = res.Result;
      this.loader = false;
    });
  }

  // drill down to insurance era tab
    gotoEra() {
    sessionStorage.setItem('eraWidget', 'true');
    window.open('#/BusinessCenter/Insurance/ERA');
    this.clearSessionStorage();
  }

  // clear storage of era
    clearSessionStorage() {
    sessionStorage.removeItem('eraWidget');
  }

  ngOnInit() {
    // get user location
    if (this.callMethods) {
    this.userLocation = this.locationService.getCurrentLocation();
    this.getWidgetDetails();
    this.checkLoc();
    }
  }
}
