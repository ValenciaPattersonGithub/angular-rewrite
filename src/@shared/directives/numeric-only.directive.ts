import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[numericOnly]',
})
export class NumericOnlyDirective {
    constructor() { }

    @HostListener('keydown', ['$event']) onKeyDown(event) {
        //allow numbers, backspace, arrow left, arrow right, arrow down, arrow up, Ctrl A, Delete
      if (!event.key.match(/[^0-9]/) || ['ArrowLeft', 'ArrowRight', 'Backspace', 'ArrowUp', 'ArrowDown', 'Tab', 'Delete'].indexOf(event.key) !== -1 || ((event.key === 'a' || event.key === 'A') && event.ctrlKey)) {
        return true;
      }
      event.preventDefault();
    }
}
