import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[validEmail]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ValidEmailDirective, multi: true}]
})

export class ValidEmailDirective implements Validator {
  validate(control: AbstractControl): {[key:string]: any} | null {
    const emailPattern = /^[a-zA-Z0-9_+]+([-.][a-zA-Z0-9_+]+)*@[a-zA-Z0-9_]+([-.][a-zA-Z0-9_]+)*\.[a-zA-Z0-9]{2,6}$/;
    
    return control.value ?
      this.validateEmail(emailPattern, control) : null;
  }

  validateEmail(nameRe: RegExp,control: AbstractControl) {
    if (control.value == '') {
      return null;
    }

    const validLength = (control.value.length <= 256);
    const regMatch = nameRe.test(control.value);
    return (validLength && regMatch) ? null : {'emailInvalid': true};
  }
    
}

