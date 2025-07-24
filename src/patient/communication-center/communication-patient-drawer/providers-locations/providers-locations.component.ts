import { Component, Inject, Input, OnInit } from '@angular/core';

@Component({
  selector: 'providers-locations',
  templateUrl: './providers-locations.component.html',
  styleUrls: ['./providers-locations.component.scss']
})
export class ProvidersLocationsComponent implements OnInit {
  @Input() patientProfile: any;
  @Input() patientLocations: any[];
  dentist: any;
  hygenist: any;
  preferedLocation: any;
  alternateLocations: any[];
  constructor(
    @Inject('referenceDataService') private referenceDataService
  ) { }

  ngOnInit() {
    if (this.patientProfile) {
      this.dentist = this.patientProfile.preferredDentist;
      this.hygenist = this.patientProfile.preferredHygienist;
    }
    const locations: any[] = this.referenceDataService.get(this.referenceDataService.entityNames.locations);
    if (this.patientLocations) {
      this.alternateLocations=[];
      const primaryLocation = this.patientLocations.filter(x => x.IsPrimary)[0];
      const locationName = locations.filter(x => x.LocationId === primaryLocation.LocationId)[0];
      if (locationName) {
        this.preferedLocation = locationName.NameLine1;
      }
      const otherLocations: any[] = this.patientLocations.filter(x => !x.IsPrimary);
      if (otherLocations) {
        otherLocations.forEach(loc => {
          this.alternateLocations.push(locations.filter(x => x.LocationId === loc.LocationId)[0].NameLine1);
        });
      }
    }
  }
}
