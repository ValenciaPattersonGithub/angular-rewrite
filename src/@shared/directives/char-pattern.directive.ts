import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[charPattern]'
})
export class CharPatternDirective {

  @Input() charPattern: string;
  @Input() disablePaste?: boolean = false;

  constructor() { }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    this.validateField(event);
  }

  @HostListener('paste', ['$event']) blockPaste(event: ClipboardEvent) {
    if(this.disablePaste)
    {
      this.validatePaste(event);
    }
  }

  validatePaste(event: ClipboardEvent) {
    event.preventDefault();    
  }

  validateField = (event) => {
    let value = event?.key;
    if (!value) {
      return;
    }
    if (new RegExp(this.charPattern).test(value)) {
      event.preventDefault();
    }
  }

}
