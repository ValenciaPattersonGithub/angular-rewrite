import { Inject, Injectable } from '@angular/core';
import { LocationsService } from '../../practices/providers';
import { AppointmentTimeService } from '../common/providers';
import { AppointmentStatusService } from '../appointment-statuses';

//@Inject('TreatmentPlansFactory') private treatmentPlanFactory

@Injectable()
export class AppointmentViewLoadingService {

    loadedLocations: any = [];
    loadedProvidersByLocation: any = [];

    currentAppointmentId: any = null;
    currentLocation: any = null;
    currentDuration: any = null;
    currentClassification: any = null;
    currentPlannedServices: any = null;
    currentPerson: any = null;
    currentRoom: any = null;
    currentProvider: any = null;
    currentAppointmentType: any = null;
    currentFullDate: any = null;
    currentStart: any = null;
    currentEnd: any = null;

    currentAppointment: any = null;
    currentPatient: any = null;

    // used to populate the after appointment save data
    currentAppointmentSaveResult: any = null;
    afterSaveEvent: string = null;

    timeIncrement: number = null;

    constructor(@Inject('referenceDataService') private referenceDataService,
        private appointmentTimeService : AppointmentTimeService,
        private appointmentStatusService : AppointmentStatusService,
        private locationsService: LocationsService,
        @Inject('CommonServices') private commonServices: any,
        @Inject('TimeZoneFactory') private timeZoneFactory) { 
            commonServices.PracticeSettings.Operations.Retrieve().$promise.then((res) => {
                this.timeIncrement = res.Value.DefaultTimeIncrement;
            });
        }

    loadAppointmentInformation(appointment, hasChanges, event) {
        this.clearAppointmentInformation();

        // will be null in some cases as we do not always want an event afterwards
        this.afterSaveEvent = event;

        if (appointment && appointment.AppointmentId && hasChanges === false) {
            this.currentAppointmentId = appointment.AppointmentId;

            // unscheduled items will fall in this category when they have not changed 
            // so we need to ensure we do not require the startTime value.
            if (appointment.StartTime) {
                this.currentFullDate = this.timeZoneFactory.ConvertDateToSaveString(appointment.StartTime, appointment.Location.Timezone)
            }
        } else if (appointment && appointment.AppointmentId && hasChanges === true) {
            // this is meant to be used by pinned and unscheduled appointments that have been updated but not saved before coming here.
            // example dragging from the pinned appointment area.

            this.currentAppointmentId = appointment.AppointmentId;

            // you can have a person when updating an unscheduled or pinned appointment
            let person = appointment.PersonId;
            if (person) {
                this.currentPerson = person;
            }

            // if location set location variable
            let ofcLocation = appointment.LocationId;
            this.currentLocation = ofcLocation;

            this.setupExtraData(appointment); // if startTime

        } else if (appointment
            && (appointment.AppointmentId === null || appointment.AppointmentId === undefined)
            && appointment.Classification === 2) {
            // we are attempting to create a new unscheduled appointment.

            // if location set location variable
            let ofcLocation = appointment.LocationId;
            this.currentLocation = ofcLocation;

            // if duration set duration variable
            let duration = appointment.ProposedDuration;
            if (duration) {
                this.currentDuration =  duration;
            }

            let classification = appointment.Classification;
            if (classification !== null && classification !== undefined) {
                this.currentClassification = classification;
            }

            // in some instances the Person is known when creating a new appointment.
            let person = appointment.PersonId;
            if (person) {
                this.currentPerson = person;

                let plannedServices = appointment.PlannedServices;
                if (plannedServices) {
                    this.currentPlannedServices = plannedServices;
                }
            }

        } else {
            // if location set location variable
            let ofcLocation = appointment.LocationId;
            this.currentLocation = ofcLocation;
            
            // in some instances the Person is known when creating a new appointment.
            let person = appointment.PersonId;
            if (person) {
                this.currentPerson = person;

                let classification = appointment.Classification;
                if (classification !== null && classification !== undefined) {
                    this.currentClassification = classification;
                }

                let plannedServices = appointment.PlannedServices;
                if (plannedServices) {
                    this.currentPlannedServices = plannedServices;
                }
            }

            this.setupExtraData(appointment); // if startTime
            // provider hours get reset in the appointment view.
        }
    }

    setupExtraData(appointment) {
        // if room set room variable
        let room = appointment.TreatmentRoomId;
        if (room) {
            this.currentRoom =  room;
        }

        // if provider set provider variable
        let provider = appointment.UserId;
        if (provider) {
            this.currentProvider = provider;
        }

        // if appointment type set appointment type variable
        let appointmentType = appointment.AppointmentTypeId;
        if (appointmentType) {
            this.currentAppointmentType = appointmentType;
        }

        // if  startTime
        if (appointment.StartTime) {
            let date = this.timeZoneFactory.ConvertDateToSaveString(appointment.StartTime, appointment.Location.Timezone);
            this.currentFullDate = date;
            this.currentStart = date;
            this.currentEnd = this.timeZoneFactory.ConvertDateToSaveString(appointment.EndTime, appointment.Location.Timezone);
        }
        
    }

    clearAppointmentInformation() {
        this.currentAppointmentId = null;
        this.currentLocation = null;
        this.currentDuration = null;
        this.currentClassification = null;
        this.currentPlannedServices = null;
        this.currentPerson = null;
        this.currentRoom = null;
        this.currentProvider = null;
        this.currentAppointmentType= null;
        this.currentFullDate = null;
        this.currentStart = null;
        this.currentEnd = null;

        this.currentAppointment = null;
        this.currentPatient = null;

        this.currentAppointmentSaveResult = null;
        this.afterSaveEvent = null;
    }

    // The appointment page expects the format of these items different then how they are coming back from the service so changing the format.
    formatPatientAccountProperties(patient) {
        if (patient !== null && patient !== undefined &&
            patient.AccountId !== null && patient.AccountId !== undefined) {
            patient.PersonAccount = {
                AccountId: patient.AccountId,
                PersonId: patient.AccountPersonId,
                InCollection: patient.InCollection
            };

            if (patient.AccountMemberId !== null && patient.AccountMemberId !== undefined) {
                patient.PersonAccount.PersonAccountMember = {
                    AccountMemberId: patient.AccountMemberId
                };
            }
        }

        return patient;
    }

    processAppointmentForViewDisplay(data) {
        let serviceCodes = this.referenceDataService.get(this.referenceDataService.entityNames.serviceCodes);
        let editing = false;
        if (data.AppointmentId !== null && data.AppointmentId !== undefined) {
            editing = true;
        }

        if (data) {

            data.Location = this.locationsService.findByLocationId(data.LocationId);

            data = this.appointmentTimeService.convertScheduleAppointmentDates(data);

            // do not set patient yet it is set later on.
            data.Patient = this.formatPatientAccountProperties(data.Patient);

            data = this.appointmentStatusService.setAppointmentStatus(data);

        } else { //TODO: not sure if this is hit or not. Need to do more checking it might not be hit any more.
            data.AppointmentTypeId = null;

            data.Patient = null;

            var ofcLocation = parseInt(this.currentLocation);
            data.Location = this.locationsService.findByLocationId(ofcLocation);
            data.LocationId = ofcLocation;

        }

        // not sure why we are doing this ... but this is probably messing with date setup some time later ....
        if (data.StartTime) {
            data.StartTime = new Date(data.StartTime);
            data.EndTime = new Date(data.EndTime);
        }

        // transform the data populating the ServiceCode collection
        // to match what is in the PlannedServices Collection if it has values.
        if (data.PlannedServices !== null
            && data.PlannedServices !== undefined
            && data.PlannedServices.length > 0) {
            data.ServiceCodes = [];
            for (let x = 0; x < data.PlannedServices.length; x++) {
                if (data.PlannedServices[x].InsuranceEstimates === null || data.PlannedServices[x].InsuranceEstimates === undefined) {
                    data.PlannedServices[x].InsuranceEstimates = [];
                }
                for (let i = 0; i < serviceCodes.length; i++) {
                    if (serviceCodes[i].ServiceCodeId === data.PlannedServices[x].ServiceCodeId) {
                        data.ServiceCodes.push(serviceCodes[i]);
                        break;
                    }
                }
            }
        } else {
            data.PlannedServices = null;
            data.ServiceCodes = null;
        }

        // Transformations so that property usage works.
        if (data.UserId != '' && data.Classification == 2 && editing) {
            data.ProviderId = data.UserId;
        } else if (data.Patient && data.Patient.PreferredDentist && data.Classification == 2 && !editing) {
            data.UserId = data.Patient.PreferredDentist;
            data.ProviderId = data.Patient.PreferredDentist;
        }

        if (!data.ProviderAppointments) {
            data.ProviderAppointments = [];
        } else {
            for (let x = 0; x < data.ProviderAppointments.length; x++) {
                if (data.ProviderAppointments[x].StartTime && typeof data.ProviderAppointments[x].StartTime == 'string' && !data.ProviderAppointments[x].StartTime.toString().toUpperCase().endsWith('Z')) {
                    data.ProviderAppointments[x].StartTime += 'Z';
                }
                if (data.ProviderAppointments[x].EndTime && typeof data.ProviderAppointments[x].EndTime == 'string' && !data.ProviderAppointments[x].EndTime.toString().toUpperCase().endsWith('Z')) {
                    data.ProviderAppointments[x].EndTime += 'Z';
                }
            }
        }

        return data;
    }

    getSavedAppointmentDetails() {
        return this.currentAppointmentSaveResult;
    }
}
