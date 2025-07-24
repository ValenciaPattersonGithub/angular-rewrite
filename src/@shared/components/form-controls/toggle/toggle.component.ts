import { forwardRef, Output } from '@angular/core';
import { Component, OnInit, Input, EventEmitter, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

// toggle is a single checkbox input element styled as a switch
@Component({
    selector: 'app-toggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppToggleComponent),
            multi: true
        }
    ]
})
export class AppToggleComponent implements ControlValueAccessor {
    @Input() label?: string;
    @Input() labelDirection?: string;
    @Input() id: string; // required
    @Input() value: any;
    // checked prop controls the starting position of the switch.
    @Input() isChecked: boolean = false;
    @Input() isDisabled: boolean;
    @Output() checkChanged: EventEmitter<Date> = new EventEmitter<Date>();
    @Output() toggled: EventEmitter<boolean> = new EventEmitter<boolean>();
    onChange: any;
    onTouched: any;

    ngOnInit() {
        this.toggled.emit(this.isChecked);
    }

    writeValue(value: string | number | boolean) {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    onCheckChange = (value: any) => {
        if (this.onChange) {
            this.onChange(value);
        }
        this.checkChanged.emit(value);
    }
    change(value: string | number | boolean) {
        if (value) {
            this.onChange(value);
            this.onTouched(value);
        }
    }

    isToggled = (event: any) => {
        if (this.isDisabled) { return; }
        this.isChecked = !this.isChecked;
        this.toggled.emit(this.isChecked);
    }

    ngOnDestroy() {
        this.toggled.unsubscribe();
        this.checkChanged.unsubscribe();
    }
}
