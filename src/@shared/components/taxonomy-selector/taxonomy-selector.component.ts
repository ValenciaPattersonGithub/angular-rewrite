import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'taxonomy-selector',
  templateUrl: './taxonomy-selector.component.html',
  styleUrls: ['./taxonomy-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: TaxonomySelectorComponent
    }]
})
export class TaxonomySelectorComponent implements OnInit, OnChanges, ControlValueAccessor {
    @Input() sbTab?: number;
    @Input() placeHolder: any;
    @Input() disableInput?: boolean=false;
    @Input() optionList: any[];
    @Input() required?: boolean = false;
    @Input() selectedItemValue: any;
    @Output() selectedItemValueChange = new EventEmitter();

    defaultItem: any;

    // Support ControlValueAccessor in Reactive Form
    onChange = (value) => {};
    onTouched = () => {};  
    touched = false;
  
    constructor(
    )
    { }

    ngOnInit(): void {
        if(this.placeHolder) {
          this.defaultItem = {Category:this.placeHolder, TaxonomyCodeId:null };
        }
    }
    
    ngOnChanges = (changes: any) => {
        if (changes.placeHolder) {
          this.defaultItem = {Category:this.placeHolder, TaxonomyCodeId:null };
        }
    }

    onSelectionChanged = (selectedItemValue: any) => {
      this.markAsTouched();     
      if(!this.disableInput) {
        this.selectedItemValueChange.emit(selectedItemValue);   
        this.onChange(selectedItemValue);
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
}
