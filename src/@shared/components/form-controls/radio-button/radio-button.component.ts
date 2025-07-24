import { Component, ElementRef, forwardRef, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-radio-button',
    templateUrl: './radio-button.component.html',
    styleUrls: ['./radio-button.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppRadioButtonComponent),
            multi: true
        }
    ]
})
export class AppRadioButtonComponent implements ControlValueAccessor {
    @Input() label: any;
    @Input() name: any;
    @Input() value: any;
    @Input() checked: boolean;
    @Input() disabled: boolean;
    @Input() customClasslbl: string;

    onChange = (value:any) => {};
    onTouched = (value:any) => {};

    
    writeValue(value: string | number | boolean) { }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    change(value: string | number | boolean) {
        this.onChange(value);
        this.onTouched(value);
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled = (isDisabled) ? isDisabled : null;
    }
}
