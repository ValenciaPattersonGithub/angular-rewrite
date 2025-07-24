import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component, ComponentRef, EmbeddedViewRef, ViewChild, ChangeDetectorRef, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
 
 
@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss']
})
  
export class PopoverComponent {
  @Input() templateReference: TemplateRef<any>;
  @Input() tooltipPosition: any;
  @Input() style:any;
  @Output() close = new EventEmitter<any>();

  closePopOver() {
    this.close.emit();
  }
  

}
 