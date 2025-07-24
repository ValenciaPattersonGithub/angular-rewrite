import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[taxrate]',
})
export class TaxrateDirective {
  @Input() taxRatePattern;
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,3}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  constructor(private el: ElementRef) {
    this.taxRatePattern = this.taxRatePattern || /^\d{0,2}(\.\d{0,3})?$/;
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const keyCode = (event.keyCode == 190 || event.keyCode == 110);  // Allow: only one decimal
    // Allow Backspace, tab, end, home, Ctrl A and Delete keys
    if (this.specialKeys.indexOf(event.key) !== -1 || ((keyCode) && this.el.nativeElement.value.indexOf('.') === -1)) {
      return true;
    }

    let current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && this.el.nativeElement.value.length > 1 && this.el.nativeElement.value.indexOf('.') < 0) {
      this.el.nativeElement.value = (this.el.nativeElement.value + '.');
    }
    if (next && !String(next).match(this.regex || this.taxRatePattern)) {
      event.preventDefault();
    }
  }

}
