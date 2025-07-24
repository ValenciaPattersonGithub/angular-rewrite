import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'are-you-sure',
  templateUrl: './are-you-sure.component.html',
  styleUrls: ['./are-you-sure.component.scss']
})
export class AreYouSureComponent implements OnInit, OnChanges {
  @Input() message: string;
  @Input() isFocusSet: boolean;
  @Input() appendId: number;
  @Output() ifNo = new EventEmitter<any>();
  @Output() ifYes = new EventEmitter<any>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    const nv = changes.isFocusSet.currentValue;
    const ov = changes.isFocusSet.previousValue;
    if (nv && nv != ov) {
      if (this.isFocusSet != null && this.isFocusSet === true) {
        var append = this.appendId ? this.appendId : '';
          document.getElementById('#btnConfirmDiscard' + append).focus();
      }
    }
  }

  ngOnInit(): void {
  }

  cancelAction = function () {
    this.ifNo.emit();
  }
  confirmAction = function () {
    this.ifYes.emit();
  }

}
