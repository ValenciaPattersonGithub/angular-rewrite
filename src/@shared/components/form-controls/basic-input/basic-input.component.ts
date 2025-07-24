import {Component, OnInit, Input, ElementRef, AfterViewInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {
    ControlContainer,
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    FormGroupDirective,
    NG_VALUE_ACCESSOR
} from '@angular/forms';


@Component({
    selector: 'app-basic-input',
    templateUrl: './basic-input.component.html',
    styleUrls: ['./basic-input.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: BasicInputComponent,
        multi: true,
    }],
    viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})

export class BasicInputComponent implements ControlValueAccessor {

    @Input() fieldId: string;
    @Input() labelDirection: string;
    @Input() labelText: string;
    @Input() placeholderText: string;
    @Input() isDisabled: boolean;
    @Input() hasErrors: boolean;
    @Input() isRequired: boolean;
    @Input() validationErrorText: string;
    @Input() inputType = 'text'; // allow for alternative input types, but default to text
    onTouched: any;
    onChange: any;
    value: any;

    constructor(
    ) {}

    blurEvent = ($event) => {
        console.log('blur activated');
    }

    change(value: Date) {
        this.onChange(value);
        this.onTouched(value);
    }
    writeValue(value: any) {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this.isDisabled = isDisabled;
    }

}
