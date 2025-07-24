import { Component, EventEmitter, OnInit, Input, Output, SimpleChanges, OnDestroy, Inject } from "@angular/core";
import { AppointmentDurationService } from 'src/scheduling/appointment-duration/appointment-duration.service';

@Component({
    selector: 'appointment-duration-dropdown',
    templateUrl: './appointment-duration-dropdown.component.html',
    styleUrls: ['./appointment-duration-dropdown.component.scss']
})
export class AppointmentDurationDropdownComponent implements OnInit, OnDestroy {
    //Input Properties - Parent to Child
    @Input() appointmentDurations: any[] = [];
    @Input() appointmentDuration: any;
    @Input() inputId: string;

    //Output Properties - Child To Parent
    @Output() appointmentDurationChanged: EventEmitter<any> = new EventEmitter<any>();

    isOpen: boolean = false;
    isDisabled: boolean = false;

    constructor(
        private appointmentDurationService: AppointmentDurationService,
        @Inject('referenceDataService') private referenceDataService
    ) { }

    ngOnInit() {
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
        this.appointmentDuration = selectedItem;
        this.isOpen = false;
        this.appointmentDurationChanged.emit(this.appointmentDuration);
    }

    ngOnDestroy() {
        this.appointmentDurationChanged.unsubscribe();

    }
}
