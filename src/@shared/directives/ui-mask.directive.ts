import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { AbstractControl, NgControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[uiMask]',
  
})
export class UiMaskDirective{
  @Input() TaxIds: any;
  validLength: any;
  validLength1: any;

  constructor(private elRef: ElementRef) { }

  uiPattern = /^\(\d{3}\)\s\d{3}-\d{4}$/;
  TaxPattern = /^\\d{2}-\d{7}$/;
  numberRegex = /[^0-9]/;
  validate(control: AbstractControl): { [key: string]: any } | null {
      let val = control.value || '';

      if(this.TaxIds === "uiMask"){
        this.validLength1 = (val.length < 11);
      }else{
        this.validLength = (val.length < 15);
      }

      if (this.validLength && (this.uiPattern.test(val) || val.length == 0)) {
          return null;
      } 

      if(this.validLength1 || val.length == 0){
        return null;
      }
  }

  @HostListener("blur") 
   onBlur() { 
     if(this.TaxIds === "uiMask"){
      if(this.elRef.nativeElement.value?.length != 10){
        this.elRef.nativeElement.value = '';
      }
    }else{
      if(this.elRef.nativeElement.value?.length != 14){
        this.elRef.nativeElement.value = '';
      }
    }
   } 


  @HostListener('keydown', ['$event']) onKeyDown(event) {
    if (!event.key.match(this.numberRegex) || ['ArrowLeft', 'ArrowRight', 'Backspace', 'ArrowUp', 'ArrowDown','Tab'].indexOf(event.key) !== -1) {
        return true;
    }
    event.preventDefault();
  }

  @HostListener('ngModelChange', ['$event'])
    onModelChange(event) {
      this.onInputChange(event, false);
    }

    @HostListener('keydown.backspace', ['$event'])
    keydownBackspace(event) {
      this.onInputChange(event.target.value, true);
    }

  onInputChange(f: any,backspace: any) {
    if(this.TaxIds === "uiMask"){
      let newVal = f?.replace(/\D/g, '');
      if (backspace && newVal?.length <= 6) {
        newVal = newVal.substring(0, newVal.length - 1);
      }
      if (newVal?.length === 0) {
        newVal = '';
      } else if (newVal?.length <= 2) {
        newVal = newVal?.replace(/^(\d{0,2})/, '$1');
      } else if (newVal?.length <= 10) {
        newVal = newVal?.replace(/^(\d{0,2})(\d{0,7})/, '$1-$2');
      } else {
        newVal = newVal?.substring(0, 10);
        newVal = newVal?.replace(/^(\d{0,2})(\d{0,7})/, '$1-$2');
      }
      
      this.elRef.nativeElement.value = '';
      this.elRef.nativeElement.value = newVal;
    }else{
      let newVal = f?.replace(/\D/g, '');
      if (backspace && newVal?.length <= 6) {
        newVal = newVal.substring(0, newVal?.length - 1);
      }
        if (newVal?.length === 0) {
          newVal = '';
        } else if (newVal?.length <= 3) {
          newVal = newVal?.replace(/^(\d{0,3})/, '($1)');
        } else if (newVal?.length <= 6) {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
        } else if (newVal?.length <= 10) {
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
        } else {
          newVal = newVal?.substring(0, 10);
          newVal = newVal?.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
        }         
        this.elRef.nativeElement.value = '';
        this.elRef.nativeElement.value = newVal;
    }
  }
}
