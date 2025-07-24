import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[focusEnter]'
})
export class FocusEnterDirective {

  constructor(private el: ElementRef, public renderer2: Renderer2) {
  }
  @HostListener('keydown', ['$event']) onKeyDown(e: any) {
    if ((e.which == 13 || e.keyCode == 13)) {
      e.preventDefault();
      var elem = e.srcElement.parentElement.nextElementSibling?.childNodes[1];
      if(e.srcElement.parentElement.nextElementSibling === null){
        return
      }else{
        elem.focus();
      }
    
  }
}
}
          
