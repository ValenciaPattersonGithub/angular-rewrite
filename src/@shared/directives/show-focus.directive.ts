import { AfterViewInit, Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[showFocus]'
})
export class ShowFocusDirective implements OnChanges{
  @Input('showFocus') newValue : any;
  constructor(private el: ElementRef) { }

  ngOnChanges(): void {
    if(this.newValue !== "" && this.newValue !== undefined){
    this.showFocus();
    }
  }

  showFocus() {
    var elem = this.el.nativeElement;
      if(this.newValue && elem){
       elem.focus();
      }
  }

}
