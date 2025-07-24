import { Directive, ElementRef, HostListener } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
    selector: '[zipField]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: ZipFieldDirective,
        multi: true
    }]
})
export class ZipFieldDirective implements Validator {
    constructor(private elRef: ElementRef) { }
    numberRegex = /[^0-9]/;

    validate(control: AbstractControl): { [key: string]: any } | null {
        let val = control.value || '';

        if ((val.length === 5 || val.length === 9 || val.length === 0)) {
            return null;
        } else {
            return { 'zipField': true };
        }
    }

    @HostListener('keydown', ['$event']) onKeyDown(event) {
        //allow numbers, backspace, arrow left, arrow right, arrow down, arrow up
        if (!event.key.match(this.numberRegex) || ['ArrowLeft', 'ArrowRight', 'Backspace', 'ArrowUp', 'ArrowDown','Tab', 'Delete'].indexOf(event.key) !== -1) {
            return true;
        }
        event.preventDefault();
    }
}
