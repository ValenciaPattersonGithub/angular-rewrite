import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { LocationHttpService } from 'src/practices/http-providers';

export interface Location {
  name: string;
  id: number;
}

@Component({
  selector: 'statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss', './kendo-styles.scss']
})
export class StatementsComponent implements OnInit {

  source: Location[] = [];
  filteredLocations: Location[] = [];
  loading: boolean;

  minDate: Date = new Date('January 1, 1900');

  form: FormGroup = new FormGroup({
    location: new FormControl(null, [Validators.required]),
    startDate: new FormControl(null, [Validators.required]),
    dueDate: new FormControl(null, [Validators.required]),
  });

  constructor(private locationHttpService: LocationHttpService) { }

  ngOnInit(): void {
    // Load the location list
    this.loadLocations();
  }

  // For now, we are just loading the locations from the API. Eventually, this may be updated
  // to load the locations from memory or from a different endpoint.
  private loadLocations(): void {
    this.loading = true;
    // 2271 is the code for finding locations where the user is able to add statements
    this.locationHttpService.getLocationsWithDetailsByPermissionsObservable(2271).pipe(
      tap((res) => this.mapLocations(res)),
      tap(() => this.loading = false)
    ).subscribe();
  }

  // Maps the API response to a simple list of name/id
  private mapLocations(res: any[]): void {
    const locs = res.map(x => {
      return {
        name: x.NameLine1,
        id: x.LocationId
      }
    });
    // Stash the mapped locations to a master list
    this.source = locs;
    // Clone the locations to allow the location filter to limit the location list when needed
    this.filteredLocations = this.source.slice();
  }

  // Update available locations when the user enters a search value
  filterChange(val: string): void {
    this.filteredLocations = this.source.filter(x => x.name.toLowerCase().includes(val?.toLowerCase()))
  }

  // When the user selects a location from the dropdown
  locationChange(location: Location): void {
    // TODO: Do something with the selected location
    console.log('selected location: ', location);
  }

  // When the user enters/selects a start date
  startDateChange(startDate: Date): void {
    // TODO: Do something with the start date
    console.log('start date: ', startDate);
  }

  // When the user enters/selects a due date
  dueDateChange(dueDate: Date): void {
    // TODO: Do something with the due date
    console.log('due date: ', dueDate);
  }

  // Disable all future dates
  futureDates = (date: Date): boolean => {
    return date > new Date();
  }

}
