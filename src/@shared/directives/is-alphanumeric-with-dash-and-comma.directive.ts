// Directive is for default handling of events preventing characters from being inserted into a field.

import { Directive, HostListener, ElementRef, Input } from '@angular/core';
@Directive({
    selector: '[isAlphaNumericWithDashAndComma]'
})
// slightly changed from an example on stackoverflow
// https://stackoverflow.com/questions/51428526/how-to-restrict-special-character-in-material-input
export class IsAlphaNumericWithDashAndCommaDirective {

    regexStr = '^[a-zA-Z0-9-,]*$';
    @Input() isAlphaNumericWithDashAndComma: boolean;

    constructor(private el: ElementRef) { }


    @HostListener('keypress', ['$event']) onKeyPress(event) {
        return new RegExp(this.regexStr).test(event.key);
    }

    @HostListener('paste', ['$event']) blockPaste(event: ClipboardEvent) {
        this.validateFields(event);
    }

    validateFields(event: ClipboardEvent) {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text/plain').replace(/[^a-zA-Z0-9-,]/g, '');
        document.execCommand('insertHTML', false, pasteData);
    }
}