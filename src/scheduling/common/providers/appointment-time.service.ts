import { Injectable, inject } from '@angular/core';

// angular barrel (using index.ts files export which allows us to have truncated path)
import { LocationTimeService } from '../../../practices/common/providers'

import * as moment from 'moment-timezone';
import { Timezone } from '../../../practices/common/models/timezone';

@Injectable()
export class AppointmentTimeService {
    pastTimezone: any;
    pastLocationTimezone: any;

    constructor(private locationTimeService: LocationTimeService) { }

    getScheduleDateDisplayFormat(timezone: string, dateItem) {
        if (dateItem === null || dateItem === undefined) {
            return dateItem;
        }

        if (typeof dateItem === 'string' && !dateItem.toLowerCase().endsWith('z')) {
            dateItem += 'Z';
        }
        //var resultMoment = moment(dateItem).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
        var resultMoment = moment(moment.tz(dateItem, timezone).format('YYYY-MM-DD HH:mm:ss'));
        return resultMoment;
    }

    convertAppointmentDates(appt) {
        let tz: Timezone;
        if (appt.Location) {
            if (this.pastLocationTimezone === appt.Location.Timezone) {
                tz = this.pastTimezone;
            }
            else {
                this.pastLocationTimezone = appt.Location.Timezone;

                tz = this.locationTimeService.getTimezoneInfo(appt.Location.Timezone, null);
                this.pastTimezone = tz;
            }
            appt.tz = tz.abbr;

            appt.originalStart = new Date(appt.StartTime);
            appt.originalEnd = new Date(appt.EndTime);

            if (appt.StartTime) {
                appt.StartTime = this.getScheduleDateDisplayFormat(tz.momentTz, appt.StartTime).toDate();
            }
            if (appt.EndTime) {
                appt.EndTime = this.getScheduleDateDisplayFormat(tz.momentTz, appt.EndTime).toDate();
            }
            appt.start = new Date(appt.StartTime);
            appt.end = new Date(appt.EndTime);

            if (appt.ProviderAppointments !== null && appt.ProviderAppointments !== undefined) {
                for (let i = 0; i < appt.ProviderAppointments.length; i++) {
                    appt.ProviderAppointments[i].originalStartTime = new Date(appt.ProviderAppointments[i].StartTime);
                    appt.ProviderAppointments[i].originalEndTime = new Date(appt.ProviderAppointments[i].EndTime);

                    appt.ProviderAppointments[i].StartTime = this.getScheduleDateDisplayFormat(tz.momentTz, appt.ProviderAppointments[i].StartTime).toDate();
                    appt.ProviderAppointments[i].EndTime = this.getScheduleDateDisplayFormat(tz.momentTz, appt.ProviderAppointments[i].EndTime).toDate();
                }
            }
        }
        else {
            console.log('no location was set for Appointment: ' + appt.AppointmentId);
        }

        return appt;
    }

    convertScheduleAppointmentDates(appt) {
        let tz: Timezone;
        if (appt.Location) {
            if (this.pastLocationTimezone === appt.Location.Timezone) {
                tz = this.pastTimezone;
            }
            else {
                this.pastLocationTimezone = appt.Location.Timezone;

                tz = this.locationTimeService.getTimezoneInfo(appt.Location.Timezone, null);
                this.pastTimezone = tz;
            }
            appt.tz = tz.abbr;

            // Figure out why we have this if statement before updating the time.
            if (!appt.originalStart && appt.StartTime) {

                appt.originalStart = new Date(appt.StartTime);
                appt.originalEnd = new Date(appt.EndTime);

                if (appt.StartTime) {
                    appt.StartTime = this.getScheduleDateDisplayFormat(tz.momentTz, appt.StartTime).toDate();
                }

                appt.EndTime = this.getScheduleDateDisplayFormat(tz.momentTz, appt.EndTime).toDate();
                
                appt.start = new Date(appt.StartTime);
                appt.end = new Date(appt.EndTime);

                for (let i = 0; i < appt.ProviderAppointments.length; i++) {
                    appt.ProviderAppointments[i].originalStartTime = new Date(appt.ProviderAppointments[i].StartTime);
                    appt.ProviderAppointments[i].originalEndTime = new Date(appt.ProviderAppointments[i].EndTime);

                    appt.ProviderAppointments[i].StartTime = this.getScheduleDateDisplayFormat(tz.momentTz, appt.ProviderAppointments[i].StartTime).toDate();
                    appt.ProviderAppointments[i].EndTime = this.getScheduleDateDisplayFormat(tz.momentTz, appt.ProviderAppointments[i].EndTime).toDate();
                }
            }
        }
        else {
            console.log('no location was set for Appointment: ' + appt.AppointmentId);
        }

        return appt;
    }

}
