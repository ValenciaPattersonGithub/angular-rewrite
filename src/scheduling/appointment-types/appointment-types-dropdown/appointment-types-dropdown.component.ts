import { Component, EventEmitter, OnInit, Input, Output, SimpleChanges, OnDestroy, Inject } from "@angular/core";
import { AppointmentTypesService } from 'src/scheduling/appointment-types/appointment-types.service';

@Component({
    selector: 'appointment-types-dropdown',
    templateUrl: './appointment-types-dropdown.component.html',
    styleUrls: ['./appointment-types-dropdown.component.scss']
})
export class AppointmentTypesDropdownComponent implements OnInit, OnDestroy {
    //Input Properties - Parent to Child
    @Input() appointmentTypes: any[] = [];
    @Input() appointmentType: any;
    @Input() inputId: string;

    //Output Properties - Child To Parent
    @Output() appointmentTypeChanged: EventEmitter<any> = new EventEmitter<any>();

    isOpen: boolean = false;
    placeholder: string = '-- No Type Selected--';
    selectedItem: string = '';
    isDisabled: boolean = false;

    constructor(
        private appointmentTypesService: AppointmentTypesService,
        @Inject('referenceDataService') private referenceDataService
    ) { }

    ngOnInit() {
        let selection = null;
        for (let i = 0; i < this.appointmentTypes.length; i++) {
            if (this.appointmentTypes[i].AppointmentTypeId === this.appointmentType) {
                selection = this.appointmentTypes[i];
            }
        }

        this.selectedItem = selection;
    }

    btnClick() {

        if (this.isOpen) {
            this.isOpen = false;
        }
        else {
            this.isOpen = true;
        }
    }


    //close dropdown when it loses focus
    onBlur() {
        if (this.isOpen) {
            this.isOpen = false;
        }
    }

    //set the selected item's description value and icon value
    selectItem(selectedItem) {
        this.selectedItem = selectedItem;
        let newValue = null;
        if (selectedItem !== null) {
            newValue = selectedItem.AppointmentTypeId;
        }
        this.isOpen = false;
        this.appointmentType = newValue; // this is just resetting what was passed in. Not a big deal.
        this.appointmentTypeChanged.emit(selectedItem);
    }


    ngOnDestroy() {
        this.appointmentTypeChanged.unsubscribe();
    }
}
