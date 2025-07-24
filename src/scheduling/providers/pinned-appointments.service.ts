import { Injectable } from '@angular/core';

// angular barrel (using index.ts files export which allows us to have truncated path)
import { RoomsService } from '../../practices/providers';
import { LocationsService } from '../../practices/providers';

import { AppointmentTypesService } from '../appointment-types/appointment-types.service';
import { ScheduleDisplayPatientService } from '../common/providers/schedule-display-patient.service';
import { ScheduleDisplayPlannedServicesService } from '../common/providers/schedule-display-planned-services.service';
import { ScheduleProvidersService } from '../common/providers/schedule-providers.service';

@Injectable()
export class PinnedAppointmentsService {
    // once more models are available change this so that the model is a pinnedAppointmentType.
    allPinnedAppointments: any[];

    constructor(
        private roomsService: RoomsService,
        private locationsService: LocationsService,
        private appointmentTypesService: AppointmentTypesService,
        private scheduleDisplayPatientService: ScheduleDisplayPatientService,
        private scheduleDisplayPlannedServicesService: ScheduleDisplayPlannedServicesService,
        private scheduleProvidersService: ScheduleProvidersService
    ) { }

    findIndexOfAppointmentId(value) {
        if (this.allPinnedAppointments && value != null) {
            for (let i = 0; i < this.allPinnedAppointments.length; i++) {
                if (this.allPinnedAppointments[i]['AppointmentId'] === value) {
                    return i;
                }
            }
        }
        return -1;
    }

    canAddToListCriteria(appointment: any, state: string) {
        return appointment.IsPinned === true
            && appointment.Classification === 2
            && state !== 'delete';
    }

    getPinnedAppointments(selectedLocationIds: number[]) {
        if (!selectedLocationIds || !this.allPinnedAppointments) {
            return [];
        }
        else {
            return this.allPinnedAppointments.filter(p => selectedLocationIds.includes(p.LocationId));
        }
    }

    // might utilize later for the appointment modal version of pinned appointments ... not being used right now
    initializePinnedAppointments(appointments: any[]) {
        this.allPinnedAppointments = [];
        if (appointments) {
            for (let i = 0; i < appointments.length; i++) {
                // we are setting up the list for the first time and there is no 'state' so just pass in empty string
                if (this.canAddToListCriteria(appointments[i], '')) { 
                    // before we were assigning AppointmentType when we were taking things out of the list ... 
                    // we get better performance making this assignment when loading the list items.
                    appointments[i]['AppointmentType'] = this.appointmentTypesService.findByAppointmentTypeId(appointments[i]['AppointmentTypeId']);

                    this.allPinnedAppointments.push(appointments[i]);
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
            let PatientAge = ''
            appt.PatientAge = '';
            appt.patientName = this.scheduleDisplayPatientService.formatPatientNameForSchedulePinnedAppointmentsArea(appt.Patient);
            if (appt.Patient.DateOfBirth) {
                PatientAge = this.scheduleDisplayPatientService.calculatePatientAge(appt.Patient.DateOfBirth).toString();
                appt.PatientAge = '(' +  PatientAge + ' ' + 'yrs' + ')'; 
            } 
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

    initializePinnedAppointmentsForSchedule(appointments: any[], serviceCodes: any[], anyProviderText: string, isScheduleInPrivacyMode: Boolean) {
        this.allPinnedAppointments = [];
        if (appointments) {
            for (let i = 0; i < appointments.length; i++) {
                let appt = appointments[i];

                // we are setting up the list for the first time and there is no 'state' so just pass in empty string
                if (this.canAddToListCriteria(appt, '')) {
                    ////////////////// things that are added to the appointment
                    appt = this.transformSingleAppointmentForSchedule(appt, serviceCodes, anyProviderText, isScheduleInPrivacyMode);
                    
                    this.allPinnedAppointments.push(appt);
                }
            }
        }
    }

    removePinnedAppointmentIfItExists(id: string) {
        if (id) {
            const index = this.findIndexOfAppointmentId(id)
            if (index > -1) {
                this.allPinnedAppointments.splice(index, 1);
            }
        }
    }

    // 
    tempAddPinnedAppointment(appointment) {
        // this method assumes we are transforming the data after checking the add criteria before calling this method
        // this is an unguarded add

        // for the time being we assume the called is pre setting the AppointmentType
        //appointment.AppointmentType = this.appointmentTypesService.findByAppointmentTypeId(appointment.AppointmentTypeId);
        this.allPinnedAppointments.push(appointment);
    }

    // if we figure out how to remove the different conversions for hub and none hub returns we can utilize the below two methods
    //addOrUpdatePinnedAppointment(appointment: any, state: string) {
    //    if (appointment) {
    //        this.removePinnedAppointmentIfItExists(appointment.AppointmentId);
    //        if (this.canAddToListCriteria(appointment, state)) {
    //            //appointment.AppointmentType = this.appointmentTypesService.findByAppointmentTypeId(appointment.AppointmentTypeId);

    //            this.allPinnedAppointments.push(appointment);
    //        }
    //    }
    //}
    //getPinnedAppointmentsWithCountExtension(selectedLocationIds: number[]) {
    //    let finalResult = {
    //        pinnedAppointments: [],
    //        count: 0
    //    }

    //    const result = this.getPinnedAppointments(selectedLocationIds);

    //    if (result) {
    //        finalResult.pinnedAppointments = result;
    //        finalResult.count = result.length; // check if this is off by 1
    //    }

    //    return finalResult;
    //}
}
