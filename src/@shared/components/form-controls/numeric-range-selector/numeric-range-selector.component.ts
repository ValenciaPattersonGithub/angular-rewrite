import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'numeric-range-selector',
  templateUrl: './numeric-range-selector.component.html',
  styleUrls: ['./numeric-range-selector.component.scss']
})
export class NumericRangeSelectorComponent implements OnInit, ControlValueAccessor {
  showPopOverNumeric = false;
  placeholderFrom = ">=";
  placeholderTo = "<=";
  formGroup: FormGroup;
  frmNumericRangePicker: FormGroup;
  @Input() gridDataNumeric: [];

  @Input() fromValue: number;
  @Input() toValue: number;
  @Input() applyBtnLabel = this.translate.instant('Apply');
  @Input() clearBtnLabel = this.translate.instant('Clear');
  @Output() filterChange = new EventEmitter<{ from: number, to: number }>();
  @ViewChild('popover') popover: ElementRef;
  private isOutsideClick = false;

  constructor(private elementRef: ElementRef, public fb: FormBuilder,private translate:TranslateService) { }

  // Support ControlValueAccessor in Reactive Form
  writeValue = () => { };
  onChange = () => { };
  onTouched = () => { };

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  ngOnInit(): void {
    this.formGroup = this.fb?.group({
      numberRangePicker: ['', ''],
    });
    this.frmNumericRangePicker = this.fb?.group({
      fromValue: [this.fromValue ? this.fromValue : '', ''],
      toValue: [this.toValue ? this.toValue : '', '']
    });
    this.setNumberRangePickerValue(this.fromValue, this.toValue);
  }

  apply = () => {
    this.fromValue = this.frmNumericRangePicker?.controls?.fromValue?.value;
    this.toValue = this.frmNumericRangePicker?.controls?.toValue?.value;
    if ((this.fromValue && this.toValue) && this.fromValue > this.toValue) {
      this.frmNumericRangePicker?.controls?.fromValue?.setErrors({ 'invalidDateRange': true })
      this.frmNumericRangePicker?.controls?.toValue?.setErrors({ 'invalidDateRange': true });
    } else {
      this.frmNumericRangePicker?.controls?.fromValue?.setErrors({ 'invalidDateRange': null });
      this.frmNumericRangePicker?.controls?.fromValue?.updateValueAndValidity();
      this.frmNumericRangePicker?.controls?.toValue?.setErrors({ 'invalidDateRange': null });
      this.frmNumericRangePicker?.controls?.toValue?.updateValueAndValidity();
      this.showPopOverNumeric = false;

      this.filterChange.emit({ from: this.fromValue, to: this.toValue });
      this.setNumberRangePickerValue(this.fromValue, this.toValue)
    }
  }

  setNumberRangePickerValue(fromValue?: number, toValue?: number) {
    if (!fromValue && !toValue) {
      this.formGroup?.controls?.numberRangePicker?.patchValue('');
    } else {
      if (fromValue && toValue) {
        const formattedValue = `>= ${fromValue} and <= ${toValue}`;
        this.formGroup?.controls?.numberRangePicker?.patchValue(formattedValue);
      } else if (fromValue) {
        const formattedValue = `>= ${fromValue}`;
        this.formGroup?.controls?.numberRangePicker?.patchValue(formattedValue);
      } else if (toValue) {
        const formattedValue = `<= ${toValue}`;
        this.formGroup?.controls?.numberRangePicker?.patchValue(formattedValue);
      }
    }
  }

  clear = () => {
    this.frmNumericRangePicker?.patchValue({
      fromValue: null,
      toValue: null
    });
  }

  toggle = (clickedOnFilter: boolean) => {
    if (clickedOnFilter) {
      this.isOutsideClick = !this.isOutsideClick;
      this.showPopOverNumeric = !this.showPopOverNumeric;

      this.frmNumericRangePicker.patchValue({
        fromValue: this.fromValue ? this.fromValue : '',
        toValue: this.toValue ? this.toValue : ''
      });
      this.setNumberRangePickerValue(this.fromValue, this.toValue);

    } else {
      this.isOutsideClick = false;
      this.showPopOverNumeric = false;
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    if (!this.elementRef?.nativeElement?.contains(event?.target) && this.isOutsideClick) {
      this.showPopOverNumeric = false;
      this.isOutsideClick = false;
    }
  }
}
