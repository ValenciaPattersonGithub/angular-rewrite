// service for pulling off transforms as we move logic out of the schedule for appointment formatting -- this is an initial idea.
import { Injectable, Inject } from '@angular/core';
declare let _: any;
@Injectable()
export class ScheduleDisplayPatientService {

    constructor() { }

    // this might be a good all around utility method ... think about it.
    // I am not sure I would like the replace being used all the time.
    ifEmptyReturnNull(value) {
        if (value === null || value === undefined || value.replace(/ /g, '') === '') {
            return null;
        }
        else {
            return value;
        }
    };

    formatPatientNameForScheduleCard(patient) {
        if (patient) {
            var displayName =
                (this.ifEmptyReturnNull(patient.FirstName) ? patient.FirstName : '') +
                (this.ifEmptyReturnNull(patient.PreferredName) ? ' (' + patient.PreferredName + ')' : '') +
                (this.ifEmptyReturnNull(patient.MiddleName) ? ' ' + patient.MiddleName : '') +
                (this.ifEmptyReturnNull(patient.LastName) ? ' ' + patient.LastName : '') +
                (this.ifEmptyReturnNull(patient.Suffix) ? ' ' + patient.Suffix : '');
            return _.escape(displayName);
        }
        return '';
    }

    formatPatientNameForSchedulePinnedAppointmentsArea(patient) {
        if (patient) {
            let displayName = patient.FirstName +
                (patient.MiddleName ? ' ' + patient.MiddleName : '') +
                ' ' + patient.LastName +
                (patient.Suffix ? ', ' + patient.Suffix : '') +
                (patient.PreferredName ? ' (' + patient.PreferredName + ')' : '') +
                (patient.DateOfBirth ? ' (' + this.calculatePatientAge(patient.DateOfBirth).toString() + ' yrs)' : '');
                return _.escape(displayName);
        }
        return '';
    }

    calculatePatientAge(birthday: string) {
        // using type coercion +() because ts does not like what we are trying to do here
        // all that does is convert the date to a number making typescript happy again.
        var ageDifferenceInMilliseconds = Date.now() - +(new Date(birthday));
        var ageDate = new Date(ageDifferenceInMilliseconds);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
}
