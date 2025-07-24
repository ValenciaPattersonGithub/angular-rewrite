import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { PatientManagementCount } from 'src/patient/common/models/patient-grid-response.model';

@Component({
  selector: 'badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent implements OnInit, ControlValueAccessor {

  @Input() countWithLoading:PatientManagementCount;
  @Input() tabList:PatientManagementCount;
  @Input() activeFltrTab:number;

  @Output() selectedBadge = new EventEmitter();
  selectedBadgeIndex:number;

  constructor() { }

  // Support ControlValueAccessor in Reactive Form
  writeValue() { }
  onChange = () => {};
  onTouched = () => {};
  
  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }

  ngOnInit(): void {
    // If a default value is not assigned, it will default to 2
    this.selectedBadgeIndex = this.activeFltrTab ? this.activeFltrTab : 2;
  }

  activateFltrTab = ( badgeIndex:number ) => {
    this.selectedBadgeIndex = badgeIndex;
    this.selectedBadge.emit(badgeIndex)
  }

}
