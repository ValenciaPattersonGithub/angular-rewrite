import { Directive, ElementRef, HostListener } from '@angular/core';
@Directive({
  selector: '[CapitalizeFirst]',
  host: {
    // When the user updates the input
    '(input)': 'onInput($event.target.value)',
  },
})
export class CapitalizeFirstDirective {
  constructor(private el: ElementRef) { }
  onInput(value: any): void {
    this.applyFormat();
  }

  applyFormat() {
    let value = this.el.nativeElement.value;
    if (value != undefined) {
      if (value.length > 0) {
        const cursorPosition = this.el.nativeElement.selectionStart;
        this.el.nativeElement.value =
          value.charAt(0).toUpperCase() + value.substring(1);
        this.el.nativeElement.selectionStart =
          this.el.nativeElement.selectionEnd = cursorPosition;
      }
    }
  }
}