import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Location } from '../location';

@Injectable({
  providedIn: 'root'
})
export class LocationDataService {
  // for location id
  private locationIdSource = new BehaviorSubject<number | null>(null);
  currentLocationId = this.locationIdSource.asObservable();

  // for location obj
  private locationSource = new BehaviorSubject<Location | null>(null);
  currentLocation = this.locationSource.asObservable();

  // for location obj
  private identifierSource = new BehaviorSubject<any | null>(null);
  locationIdentifier = this.identifierSource.asObservable();

  constructor() { }

  changeLocationId(message: number) {
    this.locationIdSource.next(message);
  }

    changeLocation(ofcLocation: Location) {
        this.locationSource.next(ofcLocation);
  }

  passLocationIdentifier(locationIdentifier) {
    this.identifierSource.next(locationIdentifier);
  }
}
