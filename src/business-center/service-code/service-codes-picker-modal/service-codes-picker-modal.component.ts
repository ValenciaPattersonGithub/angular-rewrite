import { NgTemplateOutlet } from '@angular/common';
import { ViewContainerRef } from '@angular/core';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { take } from 'rxjs/operators';

@Component({
  selector: 'service-codes-picker-modal',
  templateUrl: './service-codes-picker-modal.component.html',
  styleUrls: ['./service-codes-picker-modal.component.scss'],
})
export class ServiceCodesPickerModalComponent implements OnInit, AfterViewInit {
  @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
  dialog: DialogRef;
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter<any>(); //ToDo : Replace any type data with servicecode/locationinfo object
  @ViewChild('container', { read: ViewContainerRef })
  public containerRef: ViewContainerRef;

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    // TODO : This we need to check if we need it later
    // this.openDialog(this.templateElement);
  }

  openDialog = () => {
    if (this.dialogService) {
      this.dialog = this.dialogService.open({
        content: this.templateElement,
        appendTo: this.containerRef,
        width: '67%',
        maxHeight: '85%',
        height: '85%',
      });
    }

    if (this.dialog.result) {
      this.dialog.result.pipe(take(1)).subscribe((result: any) => {
        if (!result.primary) {
          this.dialog.close();
        }
      });
    }
  };

  close = (selectedServiceCodes = null) => {
    selectedServiceCodes
      ? this.dialog.close(selectedServiceCodes)
      : this.dialog.close();
    this.closeModal.emit(selectedServiceCodes);
  };

  onSelect = event => {
    this.close(event);
  };
}
