import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-check-box',
  templateUrl: './check-box.component.html',
  styleUrls: ['./check-box.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppCheckBoxComponent),
      multi: true
    }
  ]
})
export class AppCheckBoxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() name: any;
  @Input() value: any;
  @Input() checked: boolean;
  @Input() isDisabled: boolean;
  @Output() checkChanged: EventEmitter<Date> = new EventEmitter<Date>();
  onChange: any;
  onTouched: any;

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
}
