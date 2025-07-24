import { Injectable, Inject } from '@angular/core';
import * as moment from 'moment';
import { AppointmentStatus } from 'src/scheduling/appointment-statuses/appointment-status';
import { AppointmentStatusEnum } from 'src/scheduling/appointment-statuses/appointment-status-enum';
import { AppointmentStatusDataService } from 'src/scheduling/appointment-statuses/appointment-status-data.service';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';

@Injectable()
export class AppointmentStatusHandlingService {

    private appointmentStatuses: AppointmentStatus[];
    public appointmentStatusEnum = AppointmentStatusEnum;
    private startTimeDate: any;
    private currentDate: any;
    private tomorrow: Date = new Date();
    private statusList: AppointmentStatus[];
    private displaySelectedValue: string;
    private displaySelectedIcon: string

    constructor(@Inject(AppointmentStatusDataService) private appointmentStatusDataService,
        private patientHttpService: PatientHttpService,
        @Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory) {
        this.tomorrow.setHours(0, 0, 0, 0);
        this.tomorrow.setDate(this.tomorrow.getDate() + 1);

        /*  Set statuses so we can utilize them in the methods in this service.
         This decouples the rest of the code from the implementation allowing 
        us to get the information from other sources in the future if requirements change.
        Our only change would be how appointmentStatuses is populated.*/
        this.appointmentStatuses = JSON.parse(JSON.stringify(appointmentStatusDataService.appointmentStatuses));
    }

    // Set the Selected Value and the Selected Icon on the load of appointment page
    setSelectedValueAndIconToDisplayOnLoadOfAppointment = (appointment) => {
        this.appointmentStatuses = JSON.parse(JSON.stringify(this.appointmentStatusDataService.appointmentStatuses));
        if (appointment.Data.hasOwnProperty('AppointmentId')) {

            // if the appointment is late
            if (this.isLateAppointment(appointment)) {
                // Use the appointment status value to display on these conditions
                // 6 - In Reception, 3 - Completed, 4 - In Treatment, 5 - Ready for Check out

                if (appointment.Data.Status === 6 || appointment.Data.Status === 3 ||
                    appointment.Data.Status === 4 || appointment.Data.Status === 5) {

                    this.setDisplaySelectedValue(this.appointmentStatuses.find(x => x.id === appointment.Data.Status).description);
                    this.setDisplaySelectedIcon(this.appointmentStatuses.find(x => x.id === appointment.Data.Status).icon);
                } else { // Set Status To Late if the above conditions in the if statement weren't met
                    this.setDisplaySelectedValue(this.appointmentStatuses.find(x => x.description === 'Late').description);
                    this.setDisplaySelectedIcon(this.appointmentStatuses.find(x => x.description === 'Late').icon);
                }
            } else { // Use the appointment status value to display when the appointment is not late
                this.setDisplaySelectedValue(this.appointmentStatuses.find(x => x.id === appointment.Data.Status).description);
                this.setDisplaySelectedIcon(this.appointmentStatuses.find(x => x.id === appointment.Data.Status).icon);
            }
        } else { // Set Status to Unconfirmed on new appointment
            this.setDisplaySelectedValue(this.appointmentStatuses.find(x => x.description === 'Unconfirmed').description);
            this.setDisplaySelectedIcon(this.appointmentStatuses.find(x => x.description === 'Unconfirmed').icon);
        }
    }

    getDisplaySelectedValue = () => {
        return this.displaySelectedValue;
    }

    validateIfToDisableStatusDropdown = (selectedValue, appointment) => {
        
        if (this.disableDropdownWhenCompletedWithEncounter(selectedValue, appointment)) {
            return true;
        }
        else if (this.disableDropdownWhenNoPatientOnScheduledAppointment(appointment)) {
            return true;
        }
        return false;

    }

    private disableDropdownWhenCompletedWithEncounter(selectedValue,appointment) {
        if (appointment.Data.PlannedServices.length > 0 && appointment.Data.PlannedServices[0].EncounterId && appointment.Data.PlannedServices[0].EncounterId !== null && appointment.Data.PlannedServices[0].EncounterId !== undefined && selectedValue === "Completed") {
            return true;
        }
        return false;
    }

    private disableDropdownWhenNoPatientOnScheduledAppointment(appointment) {
        if (appointment.Data.PersonId === "" && appointment.Data.Classification === 0 && appointment.Data.ObjectState === "Add") {
            return true;
        }
        return false;
    }

    private setDisplaySelectedValue = (value: any) => {
        this.displaySelectedValue = value;
    }

    getDisplaySelectedIcon = () => {
        return this.displaySelectedIcon;
    }

    private setDisplaySelectedIcon = (value: any) => {
        this.displaySelectedIcon = value;
    }

    // Call this to populate the Appointment Status Dropdown
    populateAppointmentStatusDropdownList = (appointment: any): any[] => {
        this.appointmentStatuses = JSON.parse(JSON.stringify(this.appointmentStatusDataService.appointmentStatuses));
        // if appointment exists, enter into this if statement
        if (appointment.Data.hasOwnProperty('AppointmentId')) {
            if (appointment.Data !== null) {
                const statusList = this.appointmentStatuses;
                // Build statusList if appointment is for today or previous date
                if (this.isAppointmentForTodayOrPreviousDate(appointment.Data.StartTime)) {
                    if (appointment.Data.Status !== this.appointmentStatusEnum.ReadyForCheckout) {
                        this.statusListToDisplayWhenReadyForCheckoutNotSelected(statusList, appointment);
                    } else {
                        this.statusListToDisplayWhenReadyForCheckoutSelected(statusList);
                    }
                } else { // Build statusList if appointment is for future date
                    this.statusListToDisplayForFutureAppointment(statusList);
                    this.statusList = statusList;
                }
            }
        } else {  // This is for new appointments not saved yet that don't have an AppointmentId
            if (appointment.Data !== null) {

                const statusList = this.appointmentStatuses; 
                this.statusListToDisplayForNewAppointment(statusList, appointment);
                this.statusList = statusList;
            }
        }
        return this.statusList;
    }

    // Return the Status Id when passing in the Status Description
    convertStatusDescriptionToStatusId = (status: any): number => {
        return this.appointmentStatuses.find(x => x.description === status).id;
    }

    // return true boolean if the appointment is late
    isLateAppointment = (appointment: any) => {
        if ((moment(appointment.Data.StartTime).utc() < moment().utc())) {
            return true;
        }
        return false;
    }

    //Display the Status as Late but do not save Late Status as Status in database
    displayStatusAsLate = (appointment: any) => {
        // Display as late if not one of these Status's
        // 6 - In Reception, 3 - Completed, 4 - In Treatment, 5 - Ready for Check out,10 - Check out, 11 - Start Appointment
        if (this.isLateAppointment) {
            if (appointment.Data.Status === 6 || appointment.Data.Status === 3 ||
                appointment.Data.Status === 4 || appointment.Data.Status === 5 || appointment.Data.Status === 10 || appointment.Data.Status === 11) {
                this.setDisplaySelectedValue(this.appointmentStatuses.find(x => x.id === appointment.Data.Status).description);
                this.setDisplaySelectedIcon(appointment.Data.StatusIcon);
                
            }
            else {
                this.setDisplaySelectedValue(this.appointmentStatuses.find(x => x.description === 'Late').description);
                this.setDisplaySelectedIcon(this.appointmentStatuses.find(x => x.description === 'Late').icon);
            }
        }
    }

    // Is appointment for today or previous date
    // return true if it is and false if it isn't
    private isAppointmentForTodayOrPreviousDate = (startTime: any) => {
        if (startTime < this.tomorrow) {
            return true;
        }
        return false;
    }

    // Is this an appointment for a previous date
    // return true if it is and false if it isn't
    private isThisAPreviousDate = (startTime) => {
        this.startTimeDate = moment.utc(startTime).toDate();
        this.startTimeDate =
            this.startTimeDate.getFullYear() + '/' + (this.startTimeDate.getMonth() + 1) + '/' + this.startTimeDate.getDate();
        this.currentDate = moment.utc().toDate();
        this.currentDate = this.currentDate.getFullYear() + '/' + (this.currentDate.getMonth() + 1) + '/' + this.currentDate.getDate();
        if (this.startTimeDate < this.currentDate) {
            return true;
        }
        return false;
    }

    // Call this when the appointment status is not set to any other status except for Ready For Checkout
    private statusListToDisplayWhenReadyForCheckoutNotSelected(statusList, appointment) {
        // ctrl.originalStatus = $scope.appointment.Data.OriginalStatus;
        // Don't show Late status in List if the start time is greater than current date/time
        if ((moment(appointment.Data.StartTime).utc() > moment().utc())) {
            statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Late);
        } else if (this.isThisAPreviousDate(appointment.Data.StartTime)) {
            // Don't show In Reception if the appointment was for previous dates from the current/today's date and disable the Late status
            // Disable In Reception
            const inReception = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.InReception, statusList);
            if (statusList[inReception] !== null && statusList[inReception] !== undefined) {
                statusList[inReception].disabled = true;
            }
            // Disable Late
            const late = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.Late, statusList);
            if (statusList[late] !== null && statusList[late] !== undefined) {
                statusList[late].disabled = true;
            }
        } else { // Disable Late when the appointment is for a current/today's date and the time is past for today's date
            // Disable Late
            const late = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.Late, statusList);
            if (statusList[late] !== null && statusList[late] !== undefined) {
                statusList[late].disabled = true;
            }
        }
        // Disable Start Appointment, Add To Clipboard, and Unschedule if the patient has a running appointment already
        if (appointment.Data.Patient && appointment.Data.Patient.HasRunningAppointment) {
            const startAppointment =
                this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.StartAppointment, statusList);
            if (statusList[startAppointment] !== null && statusList[startAppointment] !== undefined) {
                statusList[startAppointment].disabled = true;
            }

            statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.AddToClipboard);
            //statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Unschedule);
        }

        //Remove Checkout if appointment has been checked out with an enounter. Don't show in list 
        if (appointment.Data.Status === this.appointmentStatusEnum.Completed && !this.isAppointmentMarkedCompletedManually(appointment)) {
            statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.CheckOut);
        }

        // Remove Ready For Checkout. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.ReadyForCheckout);
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.AddToClipboard);
        this.statusList = statusList;
    }

    // This method is used to set the status dropdown on the appointment modal when a status is set to Ready For Checkout
    private statusListToDisplayWhenReadyForCheckoutSelected = (statusList: any) => {

        // Remove Unconfirmed. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Unconfirmed);

        // Remove Reminder Sent. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.ReminderSent);

        // Remove Confirmed. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Confirmed);

        // Remove In Reception. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.InReception);

        // Remove Completed. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Completed);

        // Remove In Treatment. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.InTreatment);

        // Display ReadyForCheckout in List
        const readyForCheckout = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.ReadyForCheckout, statusList);
        if (statusList[readyForCheckout] !== null && statusList[readyForCheckout] !== undefined) {
            statusList[readyForCheckout].disabled = false;
        }
        // Remove Late. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Late);

        // Display Check out
        const checkout = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.CheckOut, statusList);
        if (statusList[checkout] !== null && statusList[checkout] !== undefined) {
            statusList[checkout].disabled = false;
        }

        // Remove Start Appointment. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.StartAppointment);

        // Remove Add to Clipboard. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.AddToClipboard);

        // Remove Unschedule. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Unschedule);


        this.statusList = statusList;
    }

    //If an EncounterId exists, then the appointment was checked out through the checkout encounter process
    //If EncounterId is null, then the appointemnt was marked manually completed
    private isAppointmentMarkedCompletedManually(appointment) {
        if (appointment.Data.PlannedServices.length > 0 && (appointment.Data.PlannedServices[0].EncounterId === null || appointment.Data.PlannedServices[0].EncounterId === undefined) && appointment.Data.Status === this.appointmentStatusEnum.Completed) {
            //Auto Save the appointment
            return true;
        }
        else if (appointment.Data.PlannedServices.length === 0 && appointment.Data.Status === this.appointmentStatusEnum.Completed) {
            return true;
        }
        return false;
    }

    // This method is used for populating the status dropdown on the modal when a new appointment is being created
    private statusListToDisplayForNewAppointment = (statusList: any, appointment: any) => {

        // If the appointment is in the future or in the past, disable In Reception
        if (!this.isAppointmentForTodayOrPreviousDate(appointment.Data.StartTime) || this.isThisAPreviousDate(appointment.Data.StartTime)) {
            // disable In Reception
            const inReception = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.InReception, statusList);
            if (statusList[inReception] !== null && statusList[inReception] !== undefined) {
                statusList[inReception].disabled = true;
            }
        }

        // disable Completed
        const completed = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.Completed, statusList);
        if (statusList[completed] !== null && statusList[completed] !== undefined) {
            statusList[completed].disabled = true;
        }
        // disable In Treatment
        const inTreatment = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.InTreatment, statusList);
        if (statusList[inTreatment] !== null && statusList[inTreatment] !== undefined) {
            statusList[inTreatment].disabled = true;
        }
        // Remove Ready for checkout. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.ReadyForCheckout);
        // Remove Late. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Late);
        // disable Check out
        const checkout = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.CheckOut, statusList);
        if (statusList[checkout] !== null && statusList[checkout] !== undefined) {
            statusList[checkout].disabled = true;
        }
        // disable Start Appointment
        const startAppointment = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.StartAppointment, statusList);
        if (statusList[startAppointment] !== null && statusList[startAppointment] !== undefined) {
            statusList[startAppointment].disabled = true;
        }

        // Remove Add to Clipboard. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.AddToClipboard);
        // Don't even show Unschedule in the list. Totally Remove it.
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Unschedule);

        this.statusList = statusList;

    }

    // This will populate the statusList for future appointments
    private statusListToDisplayForFutureAppointment = (statusList: any) => {
        // disable In Reception
        const inReception = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.InReception, statusList);
        if (statusList[inReception] !== null && statusList[inReception] !== undefined) {
            statusList[inReception].disabled = true;
        }

        // disable Completed
        const completed = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.Completed, statusList);
        if (statusList[completed] !== null && statusList[completed] !== undefined) {
            statusList[completed].disabled = true;
        }
        // disable In Treatment
        const inTreatment = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.InTreatment, statusList);
        if (statusList[inTreatment] !== null && statusList[inTreatment] !== undefined) {
            statusList[inTreatment].disabled = true;
        }
        // Remove Ready for checkout. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.ReadyForCheckout);
        // Remove Late. Don't show in list
        statusList = this.removeStatusFromList(statusList, this.appointmentStatusEnum.Late);
        // disable Check out
        const checkout = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.CheckOut, statusList);
        if (statusList[checkout] !== null && statusList[checkout] !== undefined) {
            statusList[checkout].disabled = true;
        }
        // disable Start Appointment
        const startAppointment = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.StartAppointment, statusList);
        if (statusList[startAppointment] !== null && statusList[startAppointment] !== undefined) {
            statusList[startAppointment].disabled = true;
        }

        this.statusList = statusList;
    }

    // This will remove the status from the statusList
    private removeStatusFromList = (statusList: any, id: any) => {
        if (statusList !== null && statusList !== undefined) {
            let index = null;
            for (let i = 0; i < statusList.length; i++) {
                if (statusList[i].id === id) {
                    index = i;
                    break;
                }
            }

            if (index !== null) {
                statusList.splice(index, 1);
            }

        }
        return statusList;
    }

    
    // This takes an enum id and a list and returns the index from the list of the enum id
    // The list being passed in is modified so we
    // need to use this method to get the proper index
    private findStatusIndexByEnumValueFromModifiedList = (id: any, statusList: any) => {
        for (let i = 0; i < statusList.length; i++) {
            if (statusList[i]['id'] === id) {
                return i;
            }
        }
        return null;
    }

    //Set Display Status and Icon to In Treatment when Start Appointment is selected and disable Start Appointment status in list
    setStatusToInTreatmentAndHasRunningAppointmentWhenStartAppointmentSelected = (appointment) => {
        appointment.Data.Patient.HasRunningAppointment = true;
        this.setDisplaySelectedValue(this.appointmentStatuses.find(x => x.description === 'In Treatment').description);
        this.setDisplaySelectedIcon(this.appointmentStatuses.find(x => x.description === 'In Treatment').icon);
       
    }
       
    //This will disable the StartAppointment Status option if patient has a running appointment
    //It will enable the StartAppointment Status option if patinet does not have a running appointment
    disableStartAppointmentIfPatientHasRunningAppointment = async (appointment) => {
        //When adding a new appointment from Overview, the PatientId property does not exist
        if (!appointment.Data.Patient.hasOwnProperty('PatientId')) {
            appointment.Data.Patient.PatientId = appointment.Data.PersonId;
        }

        let hasRunningAppointment = await this.hasRunningAppointment(appointment.Data.Patient.PatientId);

        if (hasRunningAppointment) {
            let statusList = [];
            statusList = this.statusList;
            const startAppointment = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.StartAppointment, statusList);
            if (statusList[startAppointment] !== null && statusList[startAppointment] !== undefined) {
                statusList[startAppointment].disabled = true;
                this.statusList = statusList;
            }
        }
        else {
                 let statusList = [];
                statusList = this.statusList;
                const startAppointment = this.findStatusIndexByEnumValueFromModifiedList(this.appointmentStatusEnum.StartAppointment, statusList);
                if (statusList[startAppointment] !== null && statusList[startAppointment] !== undefined) {
                    statusList[startAppointment].disabled = false;
                    this.statusList = statusList;
                }
        }

        appointment.Data.Patient.HasRunningAppointment = hasRunningAppointment;
    }

    //This returns true or false based on if a patient has a running appointment
    //A running appointment means the patient is In Treatment and has an ActualStartTime
    private async hasRunningAppointment(patientId: any): Promise<any> {
        try {
            let result = await this.patientHttpService.checkForRunningAppointment(patientId);
            return result.HasRunningAppointment;
        } catch (error) {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}.', ['HasRunningAppointment']), 'Error');
        }

    }


}
