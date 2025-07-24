import { Component, OnInit, Input, Inject, Output, EventEmitter, OnChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';

@Component({
    selector: 'soar-select-list',
    templateUrl: './soar-select-list.component.html',
    styleUrls: ['./soar-select-list.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi:true,
            useExisting: SoarSelectListComponent
        }]
})
export class SoarSelectListComponent implements OnInit, OnChanges, ControlValueAccessor {
    @Input() sbTab?: number;
    @Input() placeHolder: any;
    @Input() disableInput?: boolean=false;
    @Input() textField: string;
    @Input() valueField: string;
    @Input() optionList: any[];
    @Input() required?: boolean = false;
    @Input() selectedItemValue: any;
    @Output() selectedItemValueChange = new EventEmitter();
    @Output() blurEvent = new EventEmitter();
    @Input() popupSettings: { width: string, popupClass: string };
    defaultItem: any;
    itemSource: any[];

    // Support ControlValueAccessor in Reactive Form
    onChange = (value) => {};
    onTouched = () => {};
    touched = false;

    constructor(
    )
    { }

    ngOnInit(): void {
        if(this.placeHolder) {
            this.defaultItem = {text:this.placeHolder, value:null };
        }
        this.initSelectionList();
    }

    ngOnChanges = (changes: any) => {
        if (changes.placeHolder) {
            this.defaultItem = {text:this.placeHolder, value:null };
        }
        if(changes.optionList) {
            this.initSelectionList();
        }
    }

    onSelectionChanged = (selectedItemValue: any) => {
        this.markAsTouched();
        if(!this.disableInput) {
            this.selectedItemValueChange.emit(selectedItemValue);
            this.onChange(selectedItemValue);
        }
    }

    initSelectionList = ()=> {
        if (this.optionList && this.optionList.length > 0) {
            this.itemSource = [];
            this.optionList.forEach((opt) => {
                this.itemSource.push({ text: opt[this.textField], value: opt[this.valueField] });
            });
        }
    }

    // Support ControlValueAccessor in Reactive Form
    writeValue(value: any) {
        this.selectedItemValue = value;
    }

    registerOnChange(onChange: any) {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: any) {
        this.onTouched = onTouched;
    }

    markAsTouched() {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }

    setDisabledState(disabled: boolean) {
        this.disableInput = disabled;
    }

    blur = () => {
        this.markAsTouched();
        if (!this.disableInput) {
            this.blurEvent.emit();
        }
    }
    clickedOutside = (dropDownList) => {
        if ((dropDownList as DropDownListComponent)?.isOpen) {
          (dropDownList as DropDownListComponent)?.toggle(false);
        }
      }
}

