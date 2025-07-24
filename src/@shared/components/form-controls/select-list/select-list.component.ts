import { forwardRef, Output } from '@angular/core';
import { Component, OnInit, Input, EventEmitter, } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-select',
    templateUrl: './select-list.component.html',
    styleUrls: ['./select-list.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppSelectComponent),
            multi: true
        }
    ]
})
export class AppSelectComponent implements ControlValueAccessor {
    @Input() placeholder = 'Select one';
    @Input() listItems: Array<{ text: string, value: any }>;
    @Input() value?: any[] = [];
    @Input() size = 'default';
    @Input() isDisabled?: boolean;
    @Input() label?: string;
    @Input() fieldId?: string;
    @Input() labelDirection?: string;
    @Input() hasError: boolean = false;
    @Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();
    onChange: any;
    onTouched: any;

    writeValue(value: any[] | number[] | boolean[]) {
        this.value = value;
    }
    onSelection = (value: any) => {
        this.selectionChange.emit(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
