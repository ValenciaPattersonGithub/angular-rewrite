import {AfterViewInit, Component, ElementRef, forwardRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
    selector: 'app-textarea',
    templateUrl: './textarea.component.html',
    styleUrls: ['./textarea.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true
        }
    ]
})

export class TextareaComponent implements ControlValueAccessor {
    @Input() fieldId: string;
    @Input() label: string;
    @Input() labelDirection: string;
    @Input() isDisabled: boolean;
    @Input() isValid = true;
    @Input() validationText: string;
    @Input() placeholderText: string;
    @Input() noResize?: boolean;
    @Input() length?: number;
    @Input() defaultValue: string;
    @Input() isBold: boolean;

    onTouched: any;
    onChange: any;

    constructor() {
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
    }

    writeValue(obj: any): void {
    }
}
