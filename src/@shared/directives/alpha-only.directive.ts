import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[alphaOnly]'
})
export class AlphaOnlyDirective {
    regexStr = '^[a-zA-Z ]*$';
    regexString = "^[a-zA-Z-'. ]*$";

    @Input() alphaOnly: boolean;
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
            pasteData = event?.clipboardData?.getData('text/plain')?.replace(/[^a-zA-Z-'. ]/g, '');
        } else {
            pasteData = event?.clipboardData?.getData('text/plain')?.replace(/[^a-zA-Z ]/g, '');
        }
        document.execCommand('insertHTML', false, pasteData);
    }

}
