import { Component, OnInit, Input, Output, EventEmitter, forwardRef, HostListener, ViewChild, ElementRef} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs'; 
import moment from 'moment';
import { DatePickerComponent } from '@progress/kendo-angular-dateinputs';

/* This component is created as app-date-picker component in common does not have form and also invalid date criteria */
// TODO - need to check [disabledDates] CSS compatibilty with dateinput version.(not working with current-5.2.2)
@Component({
    selector: 'app-date-selector',
    templateUrl: './app-date-selector.component.html',
    styleUrls: ['./app-date-selector.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppDateSelectorComponent),
            multi: true
        }
    ]
})
export class AppDateSelectorComponent implements OnInit, ControlValueAccessor {
    @Input() id: string;
    @Input() minDate: Date = new Date('January 1, 1900');
    @Input() maxDate: Date;
    @Input() label: string;
    @Input() labelDirection: string;
    @Input() placeholder = { year: 'YYYY', month: 'MM', day: 'DD' };
    @Input() value: Date = new Date();
    @Input() isValidDate: boolean = true;
    @Input() disabled: boolean = false;
    @Input() defaultEmpty: boolean;
    @Input() fixwidth = true;
    @Input() invalidMaxDateOfBirth: boolean = false;
    @Input() enableIncompleteDateValidation = false;

    @Output() dateChanged: EventEmitter<Date> = new EventEmitter<Date>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    
    @ViewChild('datePicker') public datePickerComponent : DatePickerComponent

    dateForm: FormGroup;
    selectedDate: Date;
    onTouched: Function;
    onChange: Function;

    private date$ = new BehaviorSubject<Date | null>(null);

    constructor() { }

    ngOnInit() {
        this.selectedDate = this.getDateObj(this.value);
        this.initDateForm();
    }

    initDateForm() {
        if(this.defaultEmpty){
            this.dateForm = new FormGroup({
                datePicker: new FormControl(this.selectedDate ? new Date(this.selectedDate) : this.selectedDate),
            });
        } else {
            this.dateForm = new FormGroup({
                datePicker: new FormControl(this.selectedDate || new Date()),
            });
        }
    }

    onDateChange = (value: Date) => {
        //will return the initial validation state of control
        this.isValid.emit(this.dateForm?.get('datePicker')?.valid);
        this.date$.next(value);
        this.date$.pipe(
            debounceTime(300),
        ).subscribe(result => {
            if (this.onChange) {
                this.onChange(result);
            }
            this.dateChanged.emit(result);
            //will return validation state of control once date value is set
            this.isValid.emit(this.dateForm?.get('datePicker')?.valid);
        });
    }

    change(value: Date) {
        this.onChange(value);
        this.onTouched(value);
    }
    writeValue(value: Date) {
        this.selectedDate = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    getDateObj(val: any) {
        if (val) {
            return new Date(val);
        } else {
            if (this.defaultEmpty == true) {
                return;
            } else {
                return moment().toDate();
            }
        }
    }

    @HostListener('document:click', ['$event'])
    clickedOutsideCalendar = (event: MouseEvent) =>{      
        const isClickedInsideCalendar : boolean = ((this.datePickerComponent?.calendar?.element as ElementRef)?.nativeElement as HTMLElement)?.contains(event?.target as HTMLElement);
        const isDatePickerButtonClicked : boolean = this.datePickerComponent?.wrapper?.nativeElement?.contains(event?.target as HTMLElement);    

        if((this.datePickerComponent as DatePickerComponent)?.isOpen && !isClickedInsideCalendar && !isDatePickerButtonClicked){          
            (this.datePickerComponent as DatePickerComponent)?.toggle(false);
        }
    }
}