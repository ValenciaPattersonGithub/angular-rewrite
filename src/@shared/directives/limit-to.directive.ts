
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[limit-to]',
    //host: {
    //  '(keypress)': '_onKeypress($event)',
    //}
  })
  export class LimitToDirective {
    @Input('limit-to') limitTo; 
    
    constructor(private el: ElementRef) { }

    @HostListener("keypress", ["$event"])
    _onKeypress(e) {
       const limit = +this.limitTo;
       let value = this.el.nativeElement.value;
       if (value.length >= limit) e.preventDefault();
    }
  }
  