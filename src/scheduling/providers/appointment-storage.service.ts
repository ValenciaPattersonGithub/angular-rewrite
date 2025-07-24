// this services is used to house data going to and from the appointment view.
// earlier iterations put appointmentDates as an item being handled however that will likely change
import { Injectable } from '@angular/core';
import { AppointmentDates } from "../models/appointmentDates.model";

@Injectable()
export class AppointmentStorageService {
    // for use when returning updated information to the original caller.
    appointmentData: any = null;

    // returning data to the caller of the appointment view operation if the appointment has not been changed ... no need to reload items
    dataUpdated: boolean = false;




    appointmentDates :AppointmentDates;

    constructor() { }
}
