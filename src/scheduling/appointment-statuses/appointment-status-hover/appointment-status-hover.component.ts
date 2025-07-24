import {SimpleChanges } from '@angular/core';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppointmentStatusHandlingService } from 'src/scheduling/appointment-statuses/appointment-status-handling.service';

@Component({
    selector: 'appointment-status-hover',
    templateUrl: 'appointment-status-hover.component.html',
    styleUrls: ['./appointment-status-hover.component.scss']
})

export class AppointmentStatusHoverComponent implements OnInit {
    @Input() statusListModel: any[] = [];
    @Input() appointment: any;
    @Input() isClickable: boolean = false;
    @Output() updateAppointmentStatus: EventEmitter<any> = new EventEmitter<any>();
    isOpen = false;
    selectedValue = '';
    selectedIcon = '';
    appointmentWrapper: any;
       
    constructor(private appointmentStatusService: AppointmentStatusHandlingService) {


    }

    ngOnInit() {
        this.appointmentWrapper = { Data: this.appointment };
        this.appointmentStatusService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(this.appointmentWrapper);
        this.selectedValue = this.appointmentStatusService.getDisplaySelectedValue();
        this.selectedIcon = this.appointmentStatusService.getDisplaySelectedIcon();
        this.isOpen = false;
        this.statusListModel = this.appointmentStatusService.populateAppointmentStatusDropdownList(this.appointmentWrapper);
       
        if (!this.appointment.StartTime) {
            this.selectedValue = 'Schedule';
            this.selectedIcon = '';
            this.statusListModel = [];
        }
    }
    
    clickDropDown = (event: any) => {
        if (this.selectedValue !== 'Schedule') {
            event.stopPropagation();
            return;
        } else {
            this.appointment.IsPinned = true;
            this.appointment.IsBeingClipped = true;
            this.updateAppointmentStatus.emit(this.appointment);
            event.stopPropagation();
            return;
        }

    }

    //Make asyncronous because waiting on HasRunningAppointment call to return 
    async btnClick() {
        //Need to make sure DataTag and the Wrapper Object is up-to-date
        this.appointmentWrapper.Data = this.appointment;

        if (this.isOpen) {
            this.isOpen = false;
        }
        else {
            this.isOpen = true;
            if (this.selectedValue !== 'Schedule') {
                await this.appointmentStatusService.disableStartAppointmentIfPatientHasRunningAppointment(this.appointmentWrapper);
                this.statusListModel = this.appointmentStatusService.populateAppointmentStatusDropdownList(this.appointmentWrapper);
            }
        }

        if (this.selectedValue !== 'Schedule') {
            this.appointmentWrapper.Data.showClipboard = false;
            
        } else {
            this.appointmentWrapper.Data.showClipboard = true;
            this.appointment = this.appointmentWrapper.Data;
            this.updateAppointmentStatus.emit(this.appointment);
            event.stopPropagation();
            return;
        }
    }

    // set the seleced item's description value and icon value
    clickSelectItem = (statusListValue: any, event: any) => {
        //Need to make sure DataTag and the Wrapper Object is up-to-date
        this.appointmentWrapper.Data = this.appointment;
        this.isOpen = false;
        if (statusListValue && statusListValue.disabled) {
            event.stopPropagation();
            return;
        }
        if (this.selectedValue !== statusListValue.description) {
            //Set the $$originalStatus so we know what it was before updated
            this.appointmentWrapper.Data.$$originalStatus = this.appointmentWrapper.Data.Status;
            this.selectedValue = statusListValue.description;
            this.selectedIcon = statusListValue.icon;
            this.appointmentWrapper.Data.Status = this.appointmentStatusService.convertStatusDescriptionToStatusId(this.selectedValue);
            this.appointmentWrapper.Data.StatusIcon = this.selectedIcon;
            this.appointmentWrapper.Data.StatusName = statusListValue.description;
            
            //Check if appointment is late
            if (this.appointmentStatusService.isLateAppointment(this.appointmentWrapper)) {
                //Overwrite the Status to Late if conditions are met in this method
                this.appointmentStatusService.displayStatusAsLate(this.appointmentWrapper);
                this.selectedValue = this.appointmentStatusService.getDisplaySelectedValue();
                this.selectedIcon = this.appointmentStatusService.getDisplaySelectedIcon();
            }

            //Check if Start Appointment is the Selected Status
            if (this.selectedValue === 'Start Appointment') {
                this.appointmentStatusService.setStatusToInTreatmentAndHasRunningAppointmentWhenStartAppointmentSelected(this.appointmentWrapper);
                //Should be In Treatment
                this.selectedValue = this.appointmentStatusService.getDisplaySelectedValue();
                this.selectedIcon = this.appointmentStatusService.getDisplaySelectedIcon();
            }

            this.appointment = this.appointmentWrapper.Data;

            this.updateAppointmentStatus.emit(this.appointment);
        }
    }

    //Every appointment status for every row in grid gets changed on an update or delete of appointment
    ngOnChanges(changes: SimpleChanges) {
        this.appointmentWrapper = { Data: changes.appointment.currentValue };
        this.statusListModel = this.appointmentStatusService.populateAppointmentStatusDropdownList(this.appointmentWrapper);
             
        if (changes.appointment) {
            this.selectedValue = changes.appointment.currentValue.StatusName;
            this.selectedIcon = changes.appointment.currentValue.StatusIcon;
        }  

        //Check if appointment is late
        if (this.appointmentStatusService.isLateAppointment(this.appointmentWrapper)) {
            //Overwrite the Status to Late if conditions are met in this method
            this.appointmentStatusService.displayStatusAsLate(this.appointmentWrapper);
            this.selectedValue = this.appointmentStatusService.getDisplaySelectedValue();
            this.selectedIcon = this.appointmentStatusService.getDisplaySelectedIcon();
        }

        //If no start time, then the appointment is an Unscheduled Appointment
        if (!changes.appointment.currentValue.StartTime) {
            this.selectedValue = 'Schedule';
            this.selectedIcon = '';
            this.statusListModel = [];
        }
       
    }

    // close dropdown when it loses focus
    setOpenStatus = async  (status: boolean) => {
        if (!this.statusListModel.length) {
            status = false;
        }
        this.isOpen = status;

        if (this.isOpen && this.selectedValue !== 'Schedule') {
            await this.appointmentStatusService.disableStartAppointmentIfPatientHasRunningAppointment(this.appointmentWrapper);
            this.statusListModel = this.appointmentStatusService.populateAppointmentStatusDropdownList(this.appointmentWrapper);
        }
    }

    ngOnDestroy() {
        this.updateAppointmentStatus.unsubscribe();
    }
}
