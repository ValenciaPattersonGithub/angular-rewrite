import { Component, OnInit, Input, Output, EventEmitter, forwardRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppDatePickerComponent),
            multi: true
        }
    ]
})
export class AppDatePickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() id: any;
    @Input() minDate: Date;
    @Input() maxDate: Date;
    @Input() label: string;
    @Input() labelDirection: string;
    @Input() placeholder = { year: 'YYYY', month: 'MM', day: 'DD' };
    @Input() value: Date | null;
    @Input() isValidDate: boolean = true;
    @Output() dateChanged: EventEmitter<Date | null> = new EventEmitter<Date | null>();

    onTouched = () => { };
    onChange = (_: any) => { };

    private changeSubject = new Subject<Date | null>();
    private changeSubscription?: Subscription;

    constructor() { }

    ngOnInit() {
        this.changeSubscription = this.changeSubject
            .pipe(
                debounceTime(300),
            )
            .subscribe(value => {
                this.dateChanged.emit(value);
                this.onChange(value);
            });
    }

    ngOnDestroy() {
        if (this.changeSubscription) {
            this.changeSubscription.unsubscribe();
        }
    }

    onDateChange(value: Date | null) {
        this.changeSubject.next(value);
    }

    writeValue(value: Date | null) {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
