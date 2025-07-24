import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-location-date-picker',
    templateUrl: './location-date-picker.component.html',
    styleUrls: ['./location-date-picker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LocationDatePickerComponent),
            multi: true
        }
    ]
})
export class LocationDatePickerComponent implements OnInit, ControlValueAccessor {
    @Input() id: any;
    @Input() minDate: Date = new Date('January 1, 1900');
    @Input() maxDate: Date;
    @Input() label: string;
    @Input() labelDirection: string;
    @Input() placeholder = { year: 'YYYY', month: 'MM', day: 'DD' };
    @Input() value: Date = new Date();
    @Input() isValidDate: boolean = true;
    @Input() disabled: boolean = false;
    @Output() dateChanged: EventEmitter<Date> = new EventEmitter<Date>();
    dateForm: FormGroup;
    obs: Subscription;
    onTouched: any;
    onChange: any;

    private date$ = new BehaviorSubject<Date | null>(null);

    constructor() { }

    ngOnInit() {
        this.initDateForm();
    }

    initDateForm() {
        this.dateForm = new FormGroup({
            datePicker: new FormControl(this.value || new Date()),
        });
    }

    onDateChange = (value: Date) => {
        this.date$.next(value);
        this.obs =  this.date$.pipe(
            debounceTime(300),
        ).subscribe(result => {
            if (this.onChange) {
                this.onChange(result);
            }
            this.dateChanged.emit(result);
        });
    }

    change(value: Date) {
        this.onChange(value);
        this.onTouched(value);
    }
    writeValue(value: Date) {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    ngOnDestroy() {
       this.obs && this.obs.unsubscribe();
       }
}
