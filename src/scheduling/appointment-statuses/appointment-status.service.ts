import { Injectable, Inject } from '@angular/core';
import * as moment from 'moment';

import { AppointmentStatus } from "./appointment-status";
import { AppointmentStatusEnum } from "./appointment-status-enum";

import { AppointmentStatusDataService } from "./appointment-status-data.service";

@Injectable()
export class AppointmentStatusService {

    appointmentStatusEnum = AppointmentStatusEnum;
    appointmentStatuses: AppointmentStatus[];
    lateStatus: AppointmentStatus;
    unconfirmedStatus: AppointmentStatus;

    constructor(@Inject(AppointmentStatusDataService) AppointmentStatusDataService) {

        // Set statuses so we can utilize them in the methods in this service. This decouples the rest of the code from the implementation allowing
        // us to get the information from other sources in the future if requirements change. Our only change would be how appointmentStatuses is populated.
        this.appointmentStatuses = AppointmentStatusDataService.appointmentStatuses;

        // this value is used very often ... removing the need to search for it is a slight performance optimization for the client more if a lot of items are late
        this.lateStatus = this.getLateStatus();
        // this value can be used very often ... removing the need to search for it is a slight performance optimization for the client more if a lot of items are not set or unconfirmed
        this.unconfirmedStatus = this.getUnconfirmedStatus();
    }

    findStatusByEnumValue(id) {
        for (let i = 0; i < this.appointmentStatuses.length; i++) {
            if (this.appointmentStatuses[i]['id'] === id) {
                return this.appointmentStatuses[i];
            }
        }
        return null;
    }

    findStatusIndexByEnumValue(id) {
        for (let i = 0; i < this.appointmentStatuses.length; i++) {
            if (this.appointmentStatuses[i]['id'] === id) {
                return i;
            }
        }
        return null;
    }

    //This takes an enum id and a list and returns the index from the list of the enum id
    //The list being passed in is a list set from getStatuses() and then it is modified so we
    //need to use this method to get the proper index
    findStatusIndexByEnumValueFromModifiedList(id, statusList) {
        for (let i = 0; i < statusList.length; i++) {
            if (statusList[i]['id'] === id) {
                return i;
            }
        }
        return null;
    }

    findStatusByDescription(desc) {
        for (let i = 0; i < this.appointmentStatuses.length; i++) {
            if (this.appointmentStatuses[i]['description'] === desc) {
                return this.appointmentStatuses[i];
            }
        }
        return null;
    }

    getStatuses() {
        return this.appointmentStatuses;
    }

    getLateStatus() {
        return this.findStatusByEnumValue(AppointmentStatusEnum.Late);
    }

    getUnconfirmedStatus() {
        return this.findStatusByEnumValue(AppointmentStatusEnum.Unconfirmed);
    }

    // future work would entail adding in the type definition for some of these parameters ensuring we get the right types passed in.
    isLateAppointment(appointment, status) {
        if (!status || !appointment || appointment.Name === 'Lunch') {
            return false;
        }

        if ((status.id === this.appointmentStatusEnum['Unconfirmed'] || status.id === this.appointmentStatusEnum['ReminderSent'] || status.id === this.appointmentStatusEnum['Confirmed']) &&
            (moment(appointment.StartTime).utc() < moment().subtract(1, 'minutes').utc())) {
            return true;
        } else {
            return false;
        }
    }

    // future work would entail adding in the definition for some of these parameters ensuring we get the right types passed in.
    setAppointmentStatus(appointment) {

        if (appointment.Status === null || appointment.Status === undefined) {
            const status = this.unconfirmedStatus;
            appointment.OriginalStatus = status.id;
            appointment.Status = status.id;
            appointment.StatusIcon = status.icon;
            //console.log('Appointment Id: ' + appointment.AppointmentId + ' status was not set, so the status display will defaulted to Unconfirmed.');
            return appointment;
        }

        // if the value is set ....
        let appointmentStatusAsInt = parseInt(appointment.Status)
        let currentStatus = this.findStatusByEnumValue(appointmentStatusAsInt);

        appointment.OriginalStatus = appointment.Status;

        // only change the status to late if the appointment has been created.
        if (appointment.AppointmentId !== null && appointment.AppointmentId !== undefined) {
            if (this.isLateAppointment(appointment, currentStatus)) {
                // slight performance optimization .. when lateStatus we have already grabbed it so using the preset value that is assigned once when this type is constructed
                // this reduces the client side processing of the application when viewing late appointments.
                currentStatus = this.lateStatus;
            }
        }

        appointment.Status = currentStatus.id;
        appointment.StatusIcon = currentStatus.icon;

        return appointment;
    }
};
