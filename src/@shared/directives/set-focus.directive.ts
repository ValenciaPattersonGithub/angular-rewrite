import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[setFocus]'
})
export class SetFocusDirective implements AfterViewInit {

  constructor(private el: ElementRef, private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    this.setFocus();
  }

  setFocus = () => {
    this.changeDetectorRef.detectChanges();
    let elem = this.el?.nativeElement;
    elem?.focus();
  }
}

