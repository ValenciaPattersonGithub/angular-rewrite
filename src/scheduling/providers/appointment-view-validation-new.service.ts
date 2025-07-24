import { Inject, Injectable } from '@angular/core';
import { LocationsService } from '../../practices/providers/locations.service';


@Injectable()
export class AppointmentViewValidationNewService {

    validationErrorMessages: string = '';
    appointmentClassification: { Scheduled: number; Unscheduled: number; Block: number;} = { Scheduled: 0, Unscheduled: 2, Block: 1};
    providers: any[] = this.referenceDataService.get(this.referenceDataService.entityNames.users);
    constructor(private locationsService: LocationsService,
        @Inject('referenceDataService') private referenceDataService) { }

    validateAppointment(appointment, wasPinned = false) {
        this.validationErrorMessages = '';
        //Block Appointment Rules
        if (appointment.Classification === this.appointmentClassification.Block) {
            
            if (!appointment.hasOwnProperty('LocationId')) {
                this.validationErrorMessages += 'LocationId Property does not exist.';
            }

            if (!appointment.LocationId) {
                this.validationErrorMessages += 'LocationId must have a value.';
            }


            if (!appointment.hasOwnProperty('TreatmentRoomId')) {
                this.validationErrorMessages += 'TreatmentRoomId Property does not exist.';
            }


            if (appointment.TreatmentRoomId && appointment.LocationId) {
                let doesRoomExistInLocation = this.locationsService.doesRoomExistInLocation(appointment.TreatmentRoomId, appointment.LocationId);
                if (!doesRoomExistInLocation) {
                    this.validationErrorMessages += 'The selected room does not exist for the selected location.';
                }
            }

            if (!appointment.hasOwnProperty('ProviderId')) {
                this.validationErrorMessages += 'ProviderId Property does not exist.';
            }

            if (!appointment.TreatmentRoomId && !appointment.ProviderId) {
                this.validationErrorMessages += 'A room or a provider is required.';
            }

            if (appointment.ProviderId) {
                let isProviderinSelectedLocation = this.isProviderInSelectedLocation(appointment);
                if (!isProviderinSelectedLocation) {
                    this.validationErrorMessages += 'The selected provider does not exist for the selected location.';
                }
            }

            if (!appointment.hasOwnProperty('StartTime')) {
                this.validationErrorMessages += 'StartTime Property does not exist.';
            }

            if (!appointment.StartTime) {
                this.validationErrorMessages += 'StartTime is a required field.';
            }

            if (!appointment.hasOwnProperty('EndTime')) {
                this.validationErrorMessages += 'EndTime Property does not exist.';
            }

            if (!appointment.EndTime) {
                this.validationErrorMessages += 'EndTime is a required field.';
            }

            if (appointment.EndTime && appointment.EndTime <= appointment.StartTime) {
                this.validationErrorMessages += 'The EndTime must be greater than and not equal to the StartTime.';
            }
            
        }

        //Unscheduled Appointment Rules
        //wasPinned variable is passed in and is important. When we delete an appointment from clipboard, that is all we are doing. It still stays unscheduled. Validation does not need to be performed.
        if (appointment.Classification === this.appointmentClassification.Unscheduled && !wasPinned) {

            if (appointment.StartTime) {
                this.validationErrorMessages += 'StartTime should not be on an unscheduled appointment.';
            }

            if (appointment.EndTime) {
                this.validationErrorMessages += 'EndTime should not be on an unscheduled appointment.';
            }

            if (appointment.ProviderId) {
                let isProviderinSelectedLocation = this.isProviderInSelectedLocation(appointment);
                if (!isProviderinSelectedLocation) {
                     this.validationErrorMessages += 'The selected provider does not exist for the selected location.';
                }
            }

            this.sharedValidationRulesForScheduledAndUnscheduled(appointment);
        }

        //Scheduled Appointment Rules
        if (appointment.Classification === this.appointmentClassification.Scheduled) {
           
            if (!appointment.hasOwnProperty('ProviderAppointments')) {
                this.validationErrorMessages += 'ProviderAppointments Property does not exist.';
            }

            if (appointment.ProviderAppointments) {
                this.providerAppointmentsValidation(appointment);
            }

            
            if (!appointment.hasOwnProperty('TreatmentRoomId')) {
                this.validationErrorMessages += 'TreatmentRoomId Property does not exist.';
            }

            if (!appointment.TreatmentRoomId) {
                this.validationErrorMessages += 'Room is a required field.';
            }

            if (!appointment.hasOwnProperty('StartTime')) {
                this.validationErrorMessages += 'StartTime Property does not exist.';
            }

            if (!appointment.StartTime) {
                this.validationErrorMessages += 'StartTime is a required field.';
            }

            if (!appointment.hasOwnProperty('EndTime')) {
                this.validationErrorMessages += 'EndTime Property does not exist.';
            }

            if (!appointment.EndTime) {
                this.validationErrorMessages += 'EndTime is a required field.';
            }

            if (appointment.EndTime && appointment.EndTime <= appointment.StartTime) {
                this.validationErrorMessages += 'The EndTime must be greater than and not equal to the StartTime.';
            }


            this.sharedValidationRulesForScheduledAndUnscheduled(appointment);

        }

        return this.validationErrorMessages;
    }

    //Rules that apply for Scheduled Appointments and Unscheduled Appointments
    sharedValidationRulesForScheduledAndUnscheduled(appointment) {
        if (!appointment.hasOwnProperty('Patient')) {
            this.validationErrorMessages += 'Patient Property does not exist.';
        }

        if (!appointment.Patient) {
            this.validationErrorMessages += 'Patient is a required field.';
        }

        if (appointment.Patient && !appointment.Patient.PatientId) {
            this.validationErrorMessages += 'Patient is a required field.';
        }

        if (appointment.Patient && !appointment.Patient.IsActive) {
            this.validationErrorMessages += 'The patient must be active.';
        }
       
        if (!appointment.hasOwnProperty('LocationId')) {
            this.validationErrorMessages += 'LocationId Property does not exist.';
        }

        if (!appointment.LocationId) {
            this.validationErrorMessages += 'LocationId must have a value.';
        }

        if (appointment.Patient && !appointment.Patient.hasOwnProperty('PatientLocations')) {
            this.validationErrorMessages += 'PatientLocations Property does not exist.';
        }

                      
        if (appointment.Patient && appointment.LocationId) {

            if (appointment.Patient.PatientLocations) {
                let isSelectedLocationOneOfThePatientsAvailableLocations = this.isSelectedLocationOneOfThePatientsAvailableLocations(appointment);
                if (!isSelectedLocationOneOfThePatientsAvailableLocations) {
                    this.validationErrorMessages += 'The selected location is not one of the patients locations.';

                }
            }
        }
       
        if (appointment.ExaminingDentist) {
            let isExaminingDentistinSelectedLocation = this.isExaminingDentistInSelectedLocation(appointment);
            if (!isExaminingDentistinSelectedLocation) {
                this.validationErrorMessages += 'The selected examining dentist does not exist for the selected location.';
            }
        }

        if (appointment.TreatmentRoomId && appointment.LocationId) {
            let doesRoomExistInLocation = this.locationsService.doesRoomExistInLocation(appointment.TreatmentRoomId, appointment.LocationId);
            if (!doesRoomExistInLocation) {
                this.validationErrorMessages += 'The selected room does not exist for the selected location.';
            }
        }

        if (appointment.PlannedServices) {
            this.serviceCodeValidation(appointment);
        }

    }

    //These rules apply for Scheduled and Unscheduled Appointments
    serviceCodeValidation(appointment) {

        if (appointment.LocationId && appointment.hasOwnProperty('PlannedServices') && appointment.PlannedServices) {
            for (let i = 0; i < appointment.PlannedServices.length; i++) {

                if (!appointment.PlannedServices[i].hasOwnProperty('Code')) {
                    this.validationErrorMessages += 'Code Property does not exist on service.';
                }

                if (!appointment.PlannedServices[i].Code) {
                    this.validationErrorMessages += 'Code must have a value on service.';
                }

                if (appointment.PlannedServices[i].LocationId != appointment.LocationId) {
                    if (appointment.PlannedServices[i].Code) {
                        this.validationErrorMessages += 'The location is incorrect for service: ' + appointment.PlannedServices[i].Code + '.';
                    }
                }

                
                if (!appointment.PlannedServices[i].ProviderId) {
                    if (appointment.PlannedServices[i].Code) {
                        this.validationErrorMessages += 'A provider must be selected for service: ' + appointment.PlannedServices[i].Code + '.';
                    }
                }

                if (appointment.PlannedServices[i].ProviderId) {
                    let isProviderinSelectedLocation = this.isProviderInSelectedLocationForService(appointment,appointment.PlannedServices[i].ProviderId);
                    if (!isProviderinSelectedLocation) {
                        if (appointment.PlannedServices[i].Code) {
                            this.validationErrorMessages += 'The provider is not valid for the location for service: ' + appointment.PlannedServices[i].Code + '.';
                        }
                    }
                }
               
                //ServiceTransactionId property is not present on a New Service and the ObjectState = 'Add' (This is the condition for New Service)
                if (!appointment.PlannedServices[i].EncounterId && appointment.PlannedServices[i] && !appointment.PlannedServices[i].ServiceTransactionId && appointment.PlannedServices[i].ObjectState !== 'Add') {
                    if (appointment.PlannedServices[i].Code) {
                        this.validationErrorMessages += 'The object state must be "Add" for the new service: ' + appointment.PlannedServices[i].Code + '.';
                    }
                }

                //ServiceTransactionId property is present with an id and the ObjectState = 'Update' on Proposed Service (This is the condition for Proposed Service which has already been Saved prior to adding to appointment)
                if (!appointment.PlannedServices[i].EncounterId && appointment.PlannedServices[i] && appointment.PlannedServices[i].ServiceTransactionId && appointment.PlannedServices[i].ObjectState !== 'Update') {
                    if (appointment.PlannedServices[i].Code) {
                        this.validationErrorMessages += 'The object state must be "Update" for the proposed service: ' + appointment.PlannedServices[i].Code + '.';
                    }
                }

                if (appointment.PlannedServices[i].EncounterId && appointment.Status === 3) {
                    this.validationErrorMessages += 'The service status is a completed service that has been checked out.';
                }

                if (appointment.PlannedServices[i].EncounterId && appointment.Status === 5) {
                    this.validationErrorMessages += 'The service status is in ready for checkout.';
                }

            }
        }

    }

    //This applies only to Scheduled Appointments
    //ProviderAppointments Property is only on a scheduled appointment
    //This property stores the provider and times from the check boxes on the appointment view
    providerAppointmentsValidation(appointment) {
        let isAtLeastOneProviderTimeSlotChecked = false;
        let isProviderInSelectedLocation = false;
       
        for (let i = 0; i < appointment.ProviderAppointments.length; i++) {
            if (appointment.ProviderAppointments[i].UserId) {
                isAtLeastOneProviderTimeSlotChecked = true;

                isProviderInSelectedLocation = this.isProviderInSelectedLocationForProviderAppointments(appointment);
            }
        }

        if (!isAtLeastOneProviderTimeSlotChecked) {
            this.validationErrorMessages += 'At least one provider timeslot is required to be checked.';
        }

        if (!isProviderInSelectedLocation && isAtLeastOneProviderTimeSlotChecked) {
            this.validationErrorMessages += 'The selected provider does not exist for the selected location.';
        }
    }

    //Check to See if the selected provider exists in the selected location 
    //Do This check for Providers on Block and Uncheduled Appointments
    isProviderInSelectedLocation(appointment) {
        for (let i = 0; i < this.providers.length; i++) {
         if (appointment.UserId === this.providers[i].UserId) {
          for (let j = 0; j < this.providers[i].Locations.length; j++) {
           if (appointment.LocationId === this.providers[i].Locations[j].LocationId) {
                      return true;
           }
          }
         }
        }
        return false;
    }

    //Only do this check for ProviderAppointments on Scheduled Appointment
    isProviderInSelectedLocationForProviderAppointments(appointment) {

        for (let i = 0; i < appointment.ProviderAppointments.length; i++) {
         for (let j = 0; j < this.providers.length; j++) {
          if (appointment.ProviderAppointments[i].UserId === this.providers[j].UserId) {
           for (let k = 0; k < this.providers[j].Locations.length; k++) {
            if (appointment.LocationId === this.providers[j].Locations[k].LocationId) {
                return true;
            }
           }
          }
         }
        }
        
        return false;
    }

    //Check to See if the selected provider exists in the selected location 
    //Do This check for Providers on All Services 
    isProviderInSelectedLocationForService(appointment,plannedServiceProviderId) {
       
            for (let j = 0; j < this.providers.length; j++) {
                if (plannedServiceProviderId === this.providers[j].UserId) {
                    for (let k = 0; k < this.providers[j].Locations.length; k++) {
                        if (appointment.LocationId === this.providers[j].Locations[k].LocationId) {
                            return true;
                        }
                    }
                }
            }
        
        return false;
    }

    //This check is for Scheduled and Unscheduled Appointments
    isExaminingDentistInSelectedLocation(appointment) {

        for (let i = 0; i < this.providers.length; i++) {
            if (appointment.ExaminingDentist === this.providers[i].UserId) {
                for (let j = 0; j < this.providers[i].Locations.length; j++) {
                    if (appointment.LocationId === this.providers[i].Locations[j].LocationId) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    //This check applies to Scheduled and Unscheduled Appointments
    isSelectedLocationOneOfThePatientsAvailableLocations(appointment) {
        for (let i = 0; i < appointment.Patient.PatientLocations.length; i++) {
            

            if (!appointment.Patient.PatientLocations[i].hasOwnProperty('LocationId')) {
                this.validationErrorMessages += 'LocationId Property for PatientLocations does not exist.';
            }

            if (!appointment.Patient.PatientLocations[i].LocationId) {
                this.validationErrorMessages += 'LocationId Property for PatientLocations must have a value.';
            }

            if (appointment.LocationId === appointment.Patient.PatientLocations[i].LocationId) {
                    return true;
                }
            }
        return false;
    }

    //Get the validation errors
    getValidationErrors() {
        let errors = '';
        if (this.validationErrorMessages) {
            let newArray = this.validationErrorMessages.split('.');
            
            if (newArray.length === 1) {
                errors = '<ul><li>' + newArray.join("</li><li>"); + '</li></ul>';
            }
            else {
                errors = '<ul><li>' + newArray.join("</li><li>"); + '</li></ul>';
                errors = errors.substring(0, errors.length - 1);//this adds extra bullet point to toaster message, so I remove it
            }
            
            return errors;
        }
    }

}
