import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup } from '@angular/forms';
import { GroupResult } from '@progress/kendo-data-query';

@Component({
  selector: 'soar-select-list-with-grouping',
  templateUrl: './soar-select-list-with-grouping.component.html',
  styleUrls: ['./soar-select-list-with-grouping.component.scss']
})
export class SoarSelectListWithGroupingComponent implements OnChanges, ControlValueAccessor {

  @Input() id: string;
  @Input() textField: string;
  @Input() valueField: string;
  @Input() optionList: GroupResult;
  @Input() placeHolder: { NameLine1: string, LocationId: number };
  @Input() selectedItemValue: { NameLine1: string, LocationId: number };
  @Input() popupSettings: { width: string, popupClass: string };
  @Input() sbTab: number;
  @Input() errorLable: boolean = false;
  @Output() selectedItemValueChange = new EventEmitter();

  groupLocationForms: FormGroup = new FormGroup({
    selectedItem: new FormControl(),
  });


  constructor() { }

  writeValue = () => {};
  onChange = () => {};
  onTouched = () => {};
  
  registerOnTouched = (fn) => {
    this.onTouched = fn;
  }
  registerOnChange = (fn) => {
    this.onChange = fn;
  }


  ngOnChanges(change: SimpleChanges){
    if (change.selectedItemValue && change.selectedItemValue.currentValue) {
      this.groupLocationForms?.get('selectedItem')?.setValue(this.selectedItemValue?.LocationId)
    }
  }

  valueChange = (selectLocation) => {
    this.groupLocationForms?.get('selectedItem')?.setValue(selectLocation);
    this.selectedItemValueChange.emit(selectLocation);
  }

}
