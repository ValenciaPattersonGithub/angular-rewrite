import { Injectable, inject } from '@angular/core';
import { DurationItem } from '../appointment-duration/duration-item';

@Injectable()
export class AppointmentDurationService {
    durationList: DurationItem[];

    constructor() { }

    // add logic to build the duration list here then populate the list in the service.
    // that list can then be used to get you the necessary list of items when needed.

}
