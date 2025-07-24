import { AfterViewInit, Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[setFocusIf]'
})
export class SetFocusIfDirective implements OnChanges {
  @Input('setFocusIf') shouldFocus: any;
  constructor(private el: ElementRef) { }


  ngOnChanges(): void {
    this.setFocus();
  }

  setFocus() {
    if (this.shouldFocus) {
        var elem = this.el.nativeElement;
        if (elem.attributes.input || elem.attributes.kendoDropDownList === "") {
          elem.parentElement.focus();
        } else {
          elem.focus();
        }

    }
  }

}
