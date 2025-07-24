import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[alphaNumericText]'
})
export class AlphaNumericTextDirective {
    regexStr = '^[A-Z|a-z|0-9 ]+$';
    regexString = "^[a-zA-Z0-9-'. ]+$";

    @Input() alphaNumericText: boolean;
    @Input() allowPunctuation: boolean = false;

    constructor(private el: ElementRef) { }

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        if (this.allowPunctuation) {
            return new RegExp(this.regexString)?.test(event?.key);
        } else {
            return new RegExp(this.regexStr)?.test(event?.key);
        }
    }

    @HostListener('paste', ['$event']) blockPaste(event: ClipboardEvent) {
        this.validateFields(event);
    }

    validateFields(event: ClipboardEvent) {
        event.preventDefault();
        let pasteData = "";
        if (this.allowPunctuation) {
            pasteData = event?.clipboardData?.getData('text/plain')?.replace(/[^a-zA-Z0-9-'. ]/g, '');
        } else {
            pasteData = event?.clipboardData?.getData('text/plain')?.replace(/[^A-Z|a-z|0-9 ]/g, '');
        }
        document.execCommand('insertHTML', false, pasteData);
    }
}
