import { Injectable } from '@angular/core';

// angular barrel (using index.ts files export which allows us to have truncated path)
import { RoomsService } from '../../practices/providers';
import { LocationsService } from '../../practices/providers';

import { AppointmentTypesService } from '../appointment-types/appointment-types.service';
import { ScheduleDisplayPatientService } from '../common/providers/schedule-display-patient.service';
import { ScheduleDisplayPlannedServicesService } from '../common/providers/schedule-display-planned-services.service';
import { ScheduleProvidersService } from '../common/providers/schedule-providers.service';

@Injectable()
export class UnscheduledAppointmentsService {
    // once more models are available change this so that the model is a pinnedAppointmentType.
    allUnscheduledAppointments: any[];

    constructor(
        private roomsService: RoomsService,
        private locationsService: LocationsService,
        private appointmentTypesService: AppointmentTypesService,
        private scheduleDisplayPatientService: ScheduleDisplayPatientService,
        private scheduleDisplayPlannedServicesService: ScheduleDisplayPlannedServicesService,
        private scheduleProvidersService: ScheduleProvidersService
    ) { }

    findIndexOfAppointmentId(value) {
        if (this.allUnscheduledAppointments && value != null) {
            for (let i = 0; i < this.allUnscheduledAppointments.length; i++) {
                if (this.allUnscheduledAppointments[i]['AppointmentId'] === value) {
                    return i;
                }
            }
        }
        return -1;
    }

    canAddToListCriteria(appointment: any, state: string) {
        return appointment.Classification === 2
            && state !== 'delete';
    }

    getUnscheduledAppointments(selectedLocationIds: number[]) {
        if (!this.allUnscheduledAppointments) {
            return null;
        }
        else {
            return this.allUnscheduledAppointments;
        }
    }

    initializeUnscheduledAppointments(appointments: any[]) {
        this.allUnscheduledAppointments = [];
        if (appointments) {
            for (let i = 0; i < appointments.length; i++) {
                // we are setting up the list for the first time and there is no 'state' so just pass in empty string
                if (this.canAddToListCriteria(appointments[i], '')) {
                    // before we were assigning AppointmentType when we were taking things out of the list ... 
                    // we get better performance making this assignment when loading the list items.
                    appointments[i]['AppointmentType'] = this.appointmentTypesService.findByAppointmentTypeId(appointments[i]['AppointmentTypeId']);

                    this.allUnscheduledAppointments.push(appointments[i]);
                }
            }
        }
    }

    transformSingleAppointmentForSchedule(appt: any, serviceCodes: any[], anyProviderText: string, isScheduleInPrivacyMode: Boolean) {
        appt.Room = this.roomsService.findByRoomId(appt.TreatmentRoomId);
        appt.treatmentRoomName = appt.Room ? appt.Room.Name : '';

        appt.Location = this.locationsService.findByLocationId(appt.LocationId);
        appt.locationName = appt.Location ? appt.Location.NameLine1 : '';

        if (appt.ExaminingDentist) {
            appt.examiningDentistName = this.scheduleProvidersService.findAndformatProviderName(appt.ExaminingDentist, anyProviderText);
        } else {
            appt.examiningDentistName = '';
        }
        if (appt.UserId) {
            appt.providerName = this.scheduleProvidersService.findAndformatProviderName(appt.UserId, anyProviderText);
        } else {
            appt.providerName = '';
        }

        if (appt.Patient) {
            appt.patientName = this.scheduleDisplayPatientService.formatPatientNameForSchedulePinnedAppointmentsArea(appt.Patient);
            if (isScheduleInPrivacyMode === true) {
                appt.patientCode = appt.Patient.PatientCode;
            } else {
                appt.patientCode = '';
            }
        } else {
            appt.patientName = '';
            appt.patientCode = '';
        }

        appt = this.appointmentTypesService.setAppointmentTypeWithBaseColorsAndStyles(appt);

        // Process Amount and Services.  
        // -- we need to ensure Appointment Type is processed before this method otherwise the logic will not process correctly
        appt = this.scheduleDisplayPlannedServicesService.setAppointmentServiceDisplayTextAndAmount(appt, appt.PlannedServices, serviceCodes);

        return appt;
    }

    initializeUnscheduledAppointmentsForSchedule(appointments: any[], serviceCodes: any[], anyProviderText: string, isScheduleInPrivacyMode: Boolean) {
        this.allUnscheduledAppointments = [];
        if (appointments) {
            for (let i = 0; i < appointments.length; i++) {
                let appt = appointments[i];

                // we are setting up the list for the first time and there is no 'state' so just pass in empty string
                if (this.canAddToListCriteria(appt, '')) {
                    ////////////////// things that are added to the appointment
                    appt = this.transformSingleAppointmentForSchedule(appt, serviceCodes, anyProviderText, isScheduleInPrivacyMode);

                    this.allUnscheduledAppointments.push(appt);
                }
            }
        }
    }

    removeUnscheduledAppointmentIfItExists(id: string) {
        if (id) {
            const index = this.findIndexOfAppointmentId(id)
            if (index > -1) {
                this.allUnscheduledAppointments.splice(index, 1);
            }
        }
    }

    // 
    tempAddUnscheduledAppointment(appointment) {
        // this method assumes we are transforming the data after checking the add criteria before calling this method
        // this is an unguarded add

        // for the time being we assume the called is pre setting the AppointmentType
        //appointment.AppointmentType = this.appointmentTypesService.findByAppointmentTypeId(appointment.AppointmentTypeId);
        this.allUnscheduledAppointments.push(appointment);
    }

}
