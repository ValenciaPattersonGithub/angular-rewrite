// The appointment statuses that are used for appointments are within the domain of the appointment and scheduling area of the application given the application of the status is for appointments.
// Utilization of the type can be across modules but the definition will live here.
import { Injectable } from '@angular/core';

import {AppointmentStatus} from "./appointment-status";

// Item is separate in case we decide to get the data from an API in the future.
@Injectable()
export class AppointmentStatusDataService {

    constructor() { }

    //TODO: look at observables for future uses. ... behavior subject etc. Research to do on this for better handling (makes property private);

    // The type appears to be used for a couple of different unrelated things. Which means it has a higher degree of likely hood it will change.
    // I base this on the properties it has id and description, icon (display) and, sectionEnd which I do not understand but is probably coupling this item with another area of the application.
    // In the future we will look at removing the sectionEnd property from the model if it is bound to a different area of the application
    // so as to not couple this with other areas of the application, coupling on the client is just as bad as coupling in an API.
    // More analysis is needed regarding the eventual structure of this object.
    public appointmentStatuses: AppointmentStatus[] = [
        new AppointmentStatus(0, 'Unconfirmed', 'fas fa-question', false, true),
        new AppointmentStatus(1, 'Reminder Sent', 'far fa-bell', false, true),
        new AppointmentStatus(2, 'Confirmed', 'far fa-check', true, true),
        new AppointmentStatus(6, 'In Reception', 'far fa-watch', false, true),
        new AppointmentStatus(3, 'Completed', 'far fa-calendar-check', false, false),
        new AppointmentStatus(4, 'In Treatment', 'fas fa-user-md', false, true),
        new AppointmentStatus(5, 'Ready for Check out', 'far fa-shopping-cart', false, true),
        new AppointmentStatus(9, 'Late', 'fas fa-exclamation', false, false),
        new AppointmentStatus(10, 'Check out', 'fas fa-share', false, false),
        new AppointmentStatus(11, 'Start Appointment', 'fas fa-thumbs-up', true, false),
        new AppointmentStatus(12, 'Unschedule', null, false, false),
        new AppointmentStatus(13, 'Add to Clipboard', null, false, false)
     ];

    getAppointmentStatusesForPatientGrid = (): AppointmentStatus[] => {
       let patientGridAppoitmentStatus = this.appointmentStatuses.filter((status) => status.visibleInPatientGrid);
        patientGridAppoitmentStatus.push(new AppointmentStatus(98, 'Missed', null, false, true));
        patientGridAppoitmentStatus.push(new AppointmentStatus(99, 'Cancelled', null, false, true));
        return patientGridAppoitmentStatus;
    }

}


