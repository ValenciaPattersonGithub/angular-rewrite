import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[alphaNumericWithSpecialCharacters]'
})
export class AlphaNumericWithSpecialCharactersDirective {
    @Input() alphaNumericWithSpecialCharacters: boolean;
    @Input() allowEnter: boolean = true;

    constructor(private el: ElementRef) { }
    @HostListener('keypress', ['$event']) onKeyPress(event) {        
        const descriptionRegex = new RegExp('^[a-zA-Z0-9~@#%&$^*(){}|\/\\\\_+=?.:;,\' -]*$');        
        let allow = descriptionRegex.test(event.key)
        if (!allow === true || this.skipKeyPress(event)) {
            event.preventDefault();
        }
    }

    @HostListener('paste', ['$event']) blockPaste(event: ClipboardEvent) {
        this.validateFields(event);
    }

    validateFields(event: ClipboardEvent) {
        event.preventDefault();
        // remove any characters that don't match regex   
        const pasteData = event.clipboardData.getData('text/plain').replace(/[^a-zA-Z0-9~@#%&$^*(){}|\/\\\\_+=?.:;,\' -]/g, '');
        // NOTE, should replace this but navigator.clipboard requires user to allow read...
        document.execCommand('insertHTML', false, pasteData);
    }

    skipKeyPress(event: any): boolean {
        if (event.key === 'Enter' && this.allowEnter === false)
            return true;

        return false;
    }
}

