
 import { CurrencyPipe } from '@angular/common';
 import { Directive, ElementRef, HostListener } from '@angular/core';  
 
 
 @Directive({
     selector: '[modelformat]' 
 })
export class ModelFormatDirective {
  private numRegEx :RegExp = new RegExp(/^\d*\.?\d*$/);
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,8}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  constructor(private el: ElementRef,
    private curr : CurrencyPipe) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key == 'Decimal' ? '.' : event.key, current.slice(position)].join('');
    if (next && !String(next).match(this.regex) && !String(next).includes('$')) {
      event.preventDefault();
    }
    if(next && String(next).includes('$')){
      var decimal = String(next).split('.')[2]!=undefined ? String(next).split('.')[2].length:1;
      if(decimal==0){
        event.preventDefault();
      }
      if(!event.key.match(this.numRegEx)){
        event.preventDefault();
      }
    }
  }
  @HostListener("blur",["$event"])
  onBlur(event:any){
    let value = this.el.nativeElement.value;
    if(value.includes('$')){
      let val = this.el.nativeElement.value.substring(1);
      this.el.nativeElement.value = this.curr.transform(val,'$');

    }
    else{
      this.el.nativeElement.value = this.curr.transform(value,'$');

    }
  }


}
