/// <reference path="../appointment-status-handling.service.ts" />
import { Component, EventEmitter, OnInit, Input, Output,SimpleChanges} from '@angular/core';
import { AppointmentStatusHandlingService } from 'src/scheduling/appointment-statuses/appointment-status-handling.service';

@Component({
    selector: 'appointment-status-selector',
    templateUrl: 'appointment-status-selector.component.html',
    styleUrls: ['./appointment-status-selector.component.scss']
})

export class AppointmentStatusSelectorComponent implements OnInit{
    //Input Properties - Parent to Child
    @Input() statusListModel: any[] = [];
    @Input() appointment: any;
    @Input() disableStatusDropdown: boolean = false;
    //Output Properties - Child To Parent
    @Output() appointmentStatusChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() setDisableStatusDropdown: EventEmitter<boolean> = new EventEmitter<boolean>();
    
         
    isOpen: boolean = false;
    selectedValue: string = '';
    selectedIcon: string = '';
       
       
    constructor(private appointmentStatusService: AppointmentStatusHandlingService) {
       
    }

    ngOnInit() {
        
        //This performs the logic on what selected value to show for the status dropdown
        this.appointmentStatusService.setSelectedValueAndIconToDisplayOnLoadOfAppointment(this.appointment);
        //This gets the selected value set from the above call
        this.selectedValue = this.appointmentStatusService.getDisplaySelectedValue();
        //This gets the selected icon set from the above call
        this.selectedIcon = this.appointmentStatusService.getDisplaySelectedIcon();
        //Disable Status Dropdown
        this.disableStatusDropdown = this.appointmentStatusService.validateIfToDisableStatusDropdown(this.selectedValue, this.appointment);
        this.setDisableStatusDropdown.emit(this.disableStatusDropdown);
        //Set isOpen to false for checking if the dropdown is open
        this.isOpen = false;

        //This is rendered in the view. It is the dropdown values that should display and some may be disabled based on the logic in the s
        this.statusListModel = this.appointmentStatusService.populateAppointmentStatusDropdownList(this.appointment);

        //Convert json to array
        data => {
             Object.keys(data).map((key) => { this.statusListModel.push(data[key]) });
        };
    }
        
    btnClick() {
        if (this.isOpen) {
            this.isOpen = false;
        }
        else {
            this.isOpen = true;
        }
    }
   
    //set the selected item's description value and icon value
    clickSelectItem(selectedValue, selectedIcon) {
              
       this.selectedValue = selectedValue;
       this.selectedIcon = selectedIcon;
       this.isOpen = false;
       this.appointment.Data.Status = this.appointmentStatusService.convertStatusDescriptionToStatusId(this.selectedValue);
       this.appointment.Data.StatusIcon = this.selectedIcon;

       this.appointmentStatusChanged.emit(this.appointment);
        
        
    }
    
    //close dropdown when it loses focus
    onBlur() {
        if (this.isOpen) {
            this.isOpen = false;
        }
    }
    
  
    ngOnChanges(changes: SimpleChanges) {
        if (changes.disableStatusDropdown) {
            this.disableStatusDropdown = changes.disableStatusDropdown.currentValue;
        }
    }


    ngOnDestroy() {
        this.appointmentStatusChanged.unsubscribe();
        this.setDisableStatusDropdown.unsubscribe();
    }

   
}
